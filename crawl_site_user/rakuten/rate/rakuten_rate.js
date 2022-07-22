'use strict';

const fs = require('fs');
const axios = require('axios');
const playwright = require('playwright');
const cheerio = require('cheerio');
const { exit } = require('process');
const useHeadless = true; // "true" to use playwright
const maxVisits = 1000; // Arbitrary number for the maximum of links visited
const visited = new Set();
let allHotels = []
fs.readFile('../result_rakuten/rate_paging.json', (err, data) => {
    if (err) throw err;
    let hotelPage = JSON.parse(data);
    // console.dir(hotelPage, { depth: null, colors: true })
    const allHotels = []
    hotelPage.forEach(async (prefItem) => {
        prefItem.list_page.forEach(async (pageItem) => {
            const url = "https://review.travel.rakuten.co.jp/hotel/voice/" + prefItem.hotel_code + "/?f_time=&f_keyword=&f_age=0&f_sex=0&f_mem1=0&f_mem2=0&f_mem3=0&f_mem4=0&f_mem5=0&f_teikei=&f_version=2&f_static=1&f_point=0&f_sort=0&f_next="
                        + pageItem
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
            
            const reviewsList = []
           
            const extractContent = $ => $('#commentArea').find('.commentBox').map((_, review) => {                                         
                    const $review = $(review);
                    var purpose = []
                    $review.find('.commentPurpose dd').map((_, cmt) => {
                        const $cmt = $(cmt);
                        purpose.push($cmt.text())
                        
                    })
                    return {
                        title: $review.find('h2').text() ? $review.find('h2').text() : '0' ,
                        created_by: $review.find('.commentReputation dt').find('span.user').text().split('[')[0],
                        posted_date:  $review.find('.commentReputation dt').find('span.time').text().split('日')[0].replace(/年/g, '/').replace(/月/g, '/'),
                        content: $review.find('.commentSentence').text(),
                        companion: purpose[1],
                        travel_purpose: purpose[0],
                        plan: $review.find('.commentNote').find('dd').first().find('a').text(),
                        room: $review.find('.commentNote').find('dd').last().text(),
                    }
                    
                }).toArray();
            const crawl = async url => {                
                console.log('Crawl: ', url);
                const html = await getHtml(url)
                const $ = cheerio.load(html)               
                const content = extractContent($)
                allHotels.push({
                    "hotel_id": prefItem.hotel_code,
                    "data": {
                        rates: {
                            avg: $('.rateTotal').find('li.rate span').text(),
                            customer_service: $('.rateItem').find('li').first().find('span.rate').text(),
                            location: $('.rateItem').find('li:nth-child(2)').find('span.rate').text(),
                            room: $('.rateItem').find('li:nth-child(3)').find('span.rate').text(),
                            facility: $('.rateItem').find('li:nth-child(4)').find('span.rate').text(),
                            bath: $('.rateItem').find('li:nth-child(5)').find('span.rate').text(),
                            meal: $('.rateItem').find('li').last().find('span.rate').text(),
                        },
                        reviews: [...content]
                    }
                })
                let data = JSON.stringify(allHotels);
                fs.writeFileSync('../result_rakuten/result_rakuten_rate.json', data);

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