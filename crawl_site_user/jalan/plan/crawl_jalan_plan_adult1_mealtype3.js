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
    const allHotels = []
    hotel.forEach(async (prefItem) => {
        const medium_area_id = prefItem.medium_area_id;
        const detail_area_id = prefItem.detail_area_id;

        prefItem.hotelList.forEach(async (hotelItem) => {
            const getHotelID = hotelItem.hotel_code.split('No')[0] + hotelItem.hotel_code.split('No')[1]
            const url =
                "https://www.jalan.net/"+  getHotelID + "/plan/?screenId=UWW3001&contHideFlg=1&rootCd=041&stayCount=1&roomCount=1&dateUndecided=1&adultNum="
                + hotelItem.adult_amount + "&mealType=" + hotelItem.meal_type + "&roomCrack=200000&childPriceFlg=0,0,0,0,0&yadNo="+ hotelItem.hotel_id + "&callbackHistFlg=1&smlCd=030805&distCd=01&ccnt=yads2"

            const getHtmlPlaywright = async url => {
                const browser = await playwright.chromium.launch();
                const context = await browser.newContext();
                const page = await context.newPage();
                await page.goto(url, {
                    waitUntil: 'load',
                    // Remove the timeout
                    timeout: 0
                });
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
            
            const getProductAmount = $ => $('.jlnpc-result-count .volume span').text();

            const extractContent = $ =>
                $('.p-searchResults').find('ul li.js-searchResultItem')
                    .map((_, row) => {
                        const $row = $(row);
                        
                        return {
                            // product_amount: $('.jlnpc-result-count .volume span').text(),
                            title: $row.find('.p-planCassette__header .p-searchResultItem__catchPhrase').text().replace(/\s/g, ''),
                            min_price: $row.find('.p-searchResultItem__planTable tbody').last().find('tr td:nth-child(4) span').text().replace(/\s/g, ''),
                            plan_code: $row.attr('data-plancode'),
                            plan_index: $row.index(),
                            plan_detail_link: $row.find('.p-planCassette__picture a').attr('href'),
                        };
                    }).toArray();

            const crawl = async url => {
                visited.add(url);
                console.log('Crawl: ', url);
                const html = await getHtml(url);
                const $ = cheerio.load(html);
                const content = extractContent($)
                allHotels.push({
                    "medium_area_id": medium_area_id,
                    "detail_area_id": detail_area_id,
                    "product_info": [{
                        "hotel_id": hotelItem.hotel_id,
                        "hotel_code": hotelItem.hotel_code,
                        "product_amount": $('.jlnpc-result-count .volume span').text(),
                        "products": [...content]
                    }]                    
                });
                
                var outObject = allHotels.reduce(function(a, e) {
                    let estKey = (e['medium_area_id']);
                    
                    (a[estKey] ? a[estKey] : (a[estKey] = null || [])).push(e);
                    return a;
                }, {});

                var output = [];
                for (const [key, value] of Object.entries(outObject)) {
                    value.forEach(function (item) {
                    var existing = output.filter(function (v, i) {
                        return v.medium_area_id == item.medium_area_id;
                    });
                    if (existing.length) {
                        var existingIndex = output.indexOf(existing[0]);
                        output[existingIndex].product_info = output[existingIndex].product_info.concat(item.product_info);
                    } else {
                        if (typeof item.product_info == 'string')
                        item.product_info = [item.product_info];
                        output.push(item);
                    }
                    });
                }

                // console.dir(allHotels, { depth: null, colors: true })
                let data = JSON.stringify(output);  // final result
                fs.writeFileSync('../result_jalan/result_plan_adult1_mealtype3.json', data);
                
                let data1 = JSON.stringify(allHotels); //for plan detail                
                fs.writeFileSync('../result_jalan/plan_adult1_mealtype3.json', data1);
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