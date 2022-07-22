'use strict';

const fs = require('fs');
const axios = require('axios');
const playwright = require('playwright');
const cheerio = require('cheerio');
const { exit } = require('process');
const useHeadless = true; // "true" to use playwright
const maxVisits = 1000; // Arbitrary number for the maximum of links visited
const visited = new Set();

fs.readFile('../result_ikyu/result_ikyu_ranking_meal_type_adult1.json', (err, data) => {
    if (err) throw err;
    let hotelPage = JSON.parse(data);
    // console.dir(hotelPage, { depth: null, colors: true })
    const allHotels = []
    hotelPage.forEach(async (prefItem) => {
        prefItem.rank_type.forEach(async(hotelItem) => {
            const url = "https://www.ikyu.com" + hotelItem.plan_link
            const getHtmlPlaywright = async url => {
                const browser = await playwright.chromium.launch();
                const context = await browser.newContext();
                context.setExtraHTTPHeaders({
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36'
                })
                const page = await context.newPage();
                await page.goto(url, {
                    waitUntil: 'load',
                    // Remove the timeout
                    timeout: 0
                });
                const html = await page.content();
                // console.log(html);
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

            const extractContent = $ => $('div.overflow-hidden.my-8').map((_, item) => {
                const $item = $(item)
                // const productList = [{
                //     title: $item.find('section.flex').first().find('.w-1/2').first().find('a span.inline-block').text(),
                //     min_price: $item.find('section.flex').first().find('.w-1/2').last().find('strong.text-3xl').text(),
                // }]
                if ($('button:contains("プランをすべてみる")')){
                    $('button:contains("プランをすべてみる")').load();
                }
                return {
                    title: $item.find('div.m-4').find('h3').text(),
                    // products: [{
                    //     title: $item.find('section.flex').first().find('.w-1/2').first().find('a span.inline-block').text(),
                    //     min_price: $item.find('section.flex').first().find('.w-1/2').last().find('strong.text-3xl').text(),
                    // }]
                }
            }).toArray();


            const crawl = async url => {                
                console.log('Crawl: ', url);
                const html = await getHtml(url)
                const $ = cheerio.load(html)               
                const content = extractContent($)
                // console.log(content);
                allHotels.push({
                    "hotel_id": hotelItem.hotel_code,
                    "data": [...content]
                })
                let data = JSON.stringify(allHotels);
                fs.writeFileSync('../result_ikyu/result_ikyu_plan_adult1.json', data);

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