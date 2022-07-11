'use strict';

const fs = require('fs');
const axios = require('axios');
const playwright = require('playwright');
const cheerio = require('cheerio');
const { exit } = require('process');
const useHeadless = true; // "true" to use playwright
const maxVisits = 1000; // Arbitrary number for the maximum of links visited
const visited = new Set();
const allRooms = []

fs.readFile('./result_jalan/result_adult1_mealtype1.json', (err, data) => {
    if (err) throw err;
    let hotel = JSON.parse(data);
    console.dir(hotel, { depth: null, colors: true })
    const allHotels = []
    hotel.forEach(async (prefItem) => {
        const medium_area_id = prefItem.medium_area_id;
        const detail_area_id = prefItem.detail_area_id;

        prefItem.hotelList.forEach(async (hotelItem) => {
            const getHotelID = hotelItem.hotel_code.split('No')[0] + hotelItem.hotel_code.split('No')[1]
            const url = "https://www.jalan.net/" + getHotelID +
                "/?screenId=UWW1402&distCd=01&stayYear=&stayMonth=&stayDay=&stayCount=1&roomCount=1&dateUndecided=1&adultNum="
                + hotelItem.adult_amount + "&mealType=" + hotelItem.meal_type + "&roomCrack=100000&pageListNumArea=1_"
                + hotelItem.rank_number + "&pageListNumYad=28_1_1&yadNo="
                + hotelItem.hotel_id + "&callbackHistFlg=1";

            const getHtmlPlaywright = async url => {
                const browser = await playwright.chromium.launch();
                const context = await browser.newContext();
                const page = await context.newPage();
                await page.goto(url);
                const html = await page.content();
                await browser.close();

                return html;
            };

            const getHtmlAxios = async url => {
                const { data } = await axios.get(url);

                return data;
            };

            const getHtml = async url => {
                return useHeadless ? await getHtmlPlaywright(url) : await getHtmlAxios(url);
            };

            const columns = [], items = {}
            const extractContent = $ =>
                //    $('.shisetsu-roomsetsubi_body_wrap table:nth-child(1) tbody tr')//:nth-child(1) td').find('.jlnpc-table-col-layout table tbody tr:nth-child(2) td')
                $('.shisetsu-roomsetsubi_body_wrap table:nth-child(1) tbody tr:nth-child(1)').find('td table tr:nth-child(2) td')
                    .map((_, row) => {
                        const $row = $(row);
                        // return {
                        //     western_style_room: $row.text()
                        // }
                        return $row.text()
                    }).toArray();



            const crawl = async url => {
                visited.add(url);
                console.log('Crawl: ', url);
                const html = await getHtml(url);
                const $ = cheerio.load(html);
                const content = extractContent($)
                // console.dir(content, { depth: null, colors: true })
                allHotels.push({
                    "medium_area_id": medium_area_id,
                    "detail_area_id": detail_area_id,
                    "hotel_id": hotelItem.hotel_id,
                    "hotel_code": hotelItem.hotel_code,
                    "western_style_room": content[0].replace(/室/g, ''),
                    "japanese_style_room": content[1].replace(/室/g, ''),
                    "japanese_western_style_room": content[2].replace(/室/g, ''),
                    "other_style_room": content[3].replace(/室/g, ''),
                    "total_style_room": content[4].replace(/\n/g, '').replace(/室, '  '/g, ''),
                });
                
                console.dir(allHotels, { depth: null, colors: true })
                let data = JSON.stringify(allHotels);
                fs.writeFileSync('./result_jalan/result_room_adult1_mealtype_0.json', data);
            };


            // Change the default concurrency or pass it as param
            const queue = (concurrency = 4) => {
                let running = 0;
                const tasks = [];

                return {
                    enqueue: async (task, ...params) => {
                        tasks.push({ task, params });
                        if (running >= concurrency) {
                            return;
                        }

                        ++running;
                        while (tasks.length) {
                            const { task, params } = tasks.shift();
                            await task(...params);
                        }
                        --running;
                    },
                };
            };

            const crawlTask = async url => {
                if (visited.size >= maxVisits) {
                    console.log('Over Max Visits, exiting');
                    return;
                }

                if (visited.has(url)) {
                    return;
                }

                await crawl(url);
            };

            const q = queue();
            q.enqueue(crawlTask, url);
        })
    });

});