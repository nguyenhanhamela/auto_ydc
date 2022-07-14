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

fs.readFile('../result_jalan/result_rate_adult1_mealtype0.json', (err, data) => {
    if (err) throw err;
    let hotel = JSON.parse(data);
    console.dir(hotel, { depth: null, colors: true })
    const allReviews = []
    hotel.forEach(async (prefItem) => {
        const medium_area_id = prefItem.medium_area_id;
        const detail_area_id = prefItem.detail_area_id;

        prefItem.reviews.forEach(async (reviewItem) => {
            const getHotelID = prefItem.hotel_code.split('No')[0] + prefItem.hotel_code.split('No')[1]
            const url = "https://www.jalan.net/"+ getHotelID+ "/kuchikomi/" + reviewItem.pager + ".HTML?screenId=UWW3001&contHideFlg=1&rootCd=041&stayCount=1&roomCount=1&dateUndecided=1&adultNum="+ prefItem.adult_amount +
             "&roomCrack=200000&childPriceFlg=0,0,0,0,0&yadNo="+  prefItem.hotel_id+ "&callbackHistFlg=1&smlCd=030202&distCd=01";

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
                $('.jlnpc-kuchikomiCassette')
                    .map((_, review) => {
                        const $review = $(review)
                       
                        return {
                            title: $review.find('.jlnpc-kuchikomiCassette__lead').text().replace(/\n/g, ''),
                            created_by: $review.find('.jlnpc-kuchikomiCassette__userName a').text(),
                            posted_date: $review.find('p.jlnpc-kuchikomiCassette__postDate').text(),
                            sex: $review.find('.jlnpc-kuchikomiCassette__leftArea__contHead span:nth-child(1)').text().split('/')[0].replace(/\n/g, ''),
                            age: $review.find('.jlnpc-kuchikomiCassette__leftArea__contHead span:nth-child(1)').text().split('/')[1],//.replace(/\n/g, ''),
                            travel_purpose: $review.find('.jlnpc-kuchikomiCassette__leftArea__contHead span:nth-child(2)').text(),                                                       
                            rate: $review.find('.jlnpc-kuchikomiCassette__totalRate').text(),
                            content: $review.find('.jlnpc-kuchikomiCassette__postBody').text(),
                            season: $review.find('.jlnpc-kuchikomiCassette__planInfoList--plan').find('dd').first().text(),
                            price_range: $review.find('.jlnpc-kuchikomiCassette__planInfo dl:nth-child(3)').find('dd').text().replace(/\n/g, ''),
                            rate: {
                                room: $review.find('dl.jlnpc-kuchikomiCassette__rateList').find('dd').first().text(),
                                bath: $review.find('dl.jlnpc-kuchikomiCassette__rateList').find('dd:nth-child(2)').text(),
                                breakfast: $review.find('dl.jlnpc-kuchikomiCassette__rateList').find('dd:nth-child(3)').text(),
                                dinner: $review.find('dl.jlnpc-kuchikomiCassette__rateList').find('dd:nth-child(4)').text(),
                                customer_service: $review.find('dl.jlnpc-kuchikomiCassette__rateList').find('dd:nth-child(5)').text(),
                                cleanliness: $review.find('dl.jlnpc-kuchikomiCassette__rateList').find('dd:nth-child(6)').text(),
                            }
                        }
                    }).toArray();          

                const extractContentRateList = $ =>
                    $('dl.jlnpc-kuchikomiCassette__rateList').find('dd')
                        .map((_, rateLst) => {
                            const $rateLst = $(rateLst)
                            return $rateLst.text()
                        }).toArray();
            const crawl = async url => {
                visited.add(url);
                console.log('Crawl: ', url);
                const html = await getHtml(url);
                const $ = cheerio.load(html);
                const content = extractContent($)
                const contentRate = extractContentRateList($)
                allReviews.push({
                    "medium_area_id": medium_area_id,
                    "hotel_id": prefItem.hotel_id,
                    "rates": prefItem.rates,
                    "reviews": [...content],                    
                })
                var outObject = allReviews.reduce(function(a, e) {               
                let estKey = (e['hotel_id']); 
                
                (a[estKey] ? a[estKey] : (a[estKey] = null || [])).push(e);
                return a;
                }, {});

                // for (const [key, value] of Object.entries(outObject)) {                    
                //     var output = [];

                //     value.forEach(function (item) {
                //     var existing = output.filter(function (v, i) {
                //         return v.medium_area_id == item.medium_area_id;
                //     });
                //     if (existing.length) {
                //         var existingIndex = output.indexOf(existing[0]);
                //         output[existingIndex].hotelList = output[existingIndex].hotelList.concat(item.hotelList);
                //     } else {
                //         if (typeof item.hotelList == 'string')
                //         item.hotelList = [item.hotelList];
                //         output.push(item);
                //     }
                //     });
                // }
                
                // console.log(output);

                // let data = JSON.stringify(output);
                fs.writeFileSync('../result_jalan/result_reviews_adult1_mealtype0.json', data);
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