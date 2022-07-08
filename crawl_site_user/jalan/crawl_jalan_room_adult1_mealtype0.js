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

fs.readFile('./result_jalan/result_adult1_mealtype_0.json', (err, data) => {
    if (err) throw err;
    let hotel = JSON.parse(data);
    console.dir(hotel, { depth: null, colors: true })
    hotel.forEach(async(prefItem) => {
        prefItem.hotelList.forEach(async(hotelItem) => {
            const getHotelID = hotelItem.hotel_code.split('No')[0] + hotelItem.hotel_code.split('No')[1]
            const url = "https://www.jalan.net/"+ getHotelID +
            "/?screenId=UWW1402&distCd=01&stayYear=&stayMonth=&stayDay=&stayCount=1&roomCount=1&dateUndecided=1&adultNum="
            + hotelItem.adult_amount+ "&mealType="+ hotelItem.meal_type+ "&roomCrack=100000&pageListNumArea=1_"
            + hotelItem.rank_number+"&pageListNumYad=28_1_1&yadNo="
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
                $('.shisetsu-roomsetsubi_body_wrap').find('.shisetsu-roomsetsubi_body tbody tr .jlnpc-table-col-layout table tbody tr:nth-child(2) > td')
                .map((_, row) => {
                    const $row = $(row);
                    // console.log($row.index());
                    // if ($row.index() === 0) {
                        return {
                            western_style_room: $row.text(),
                        }                    
                    // }                                       
                }).toArray();
            

            const crawl = async url => {
                visited.add(url);
                console.log('Crawl: ', url);
                const html = await getHtml(url);
                const $ = cheerio.load(html);
                const content = extractContent($)
                console.log(content);
                console.dir(content, { depth: null, colors: true })
                // allRooms.push(...content)
                // console.log(allRooms);
                // allHotels.push({
                //     "medium_area_id": kenCd,
                //     "detail_area_id": lrgCd,
                //     "hotelList": [...content]
                // });
            
                // console.log(allHotels.length);
                // let data = JSON.stringify(allHotels);
                // fs.writeFileSync('./result_jalan/result_adult1_mealtype_0.json', data);
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