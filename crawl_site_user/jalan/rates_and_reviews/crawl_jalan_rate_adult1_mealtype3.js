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

fs.readFile('../result_jalan/result_adult1_mealtype3.json', (err, data) => {
    if (err) throw err;
    let hotel = JSON.parse(data);
    console.dir(hotel, { depth: null, colors: true })
    const allRates = []
    hotel.forEach(async (prefItem) => {
        const medium_area_id = prefItem.medium_area_id;
        const detail_area_id = prefItem.detail_area_id;

        prefItem.hotelList.forEach(async (hotelItem) => {
            const getHotelID = hotelItem.hotel_code.split('No')[0] + hotelItem.hotel_code.split('No')[1]
            const url = "https://www.jalan.net/"+ getHotelID+ "/kuchikomi/?screenId=UWW3001&contHideFlg=1&rootCd=041&stayCount=1&roomCount=1&dateUndecided=1&adultNum="
            + hotelItem.adult_amount + "&roomCrack=200000&childPriceFlg=0,0,0,0,0&yadNo="+  hotelItem.hotel_id+ "&callbackHistFlg=1&smlCd="+ prefItem.smlCd + "&distCd=01";

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
                $('.pagerLink').find('.page')
                    .map((_, txt) => {
                        const $txt = $(txt)
                        return {                           
                            "pager": $txt.text()
                        }
                    }).toArray();

            const extractRates = $ => 
                $('.jlnpc-kuchikomi__catTable').find('td.jlnpc-kuchikomi__catTable__point')
                    .map((_, row) => {
                        const $row = $(row)
                        return $row.text();
                    }).toArray();
            
            const crawl = async url => {
                visited.add(url);
                console.log('Crawl: ', url);
                const html = await getHtml(url);
                const $ = cheerio.load(html);
                const content = extractContent($)
                const contentRate = extractRates($)
                allRates.push({
                    "medium_area_id": medium_area_id,
                    "detail_area_id": detail_area_id,
                    "hotel_id": hotelItem.hotel_id,
                    "hotel_code": hotelItem.hotel_code,
                    "adult_amount": hotelItem.adult_amount,
                    "rates": {
                        "room": contentRate[0],
                        "bath": contentRate[1],
                        "breakfast": contentRate[2],
                        "dinner": contentRate[3],
                        "customer_service": contentRate[4],
                        "cleanliness": contentRate[5],
                    },
                    "reviews": [...content]
                })
                console.dir(contentRate, { depth: null, colors: true })

                let data = JSON.stringify(allRates);
                fs.writeFileSync('../result_jalan/result_rate_adult1_mealtype3.json', data);
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