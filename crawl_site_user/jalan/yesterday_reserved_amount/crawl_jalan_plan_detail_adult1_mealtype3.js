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

fs.readFile('../result_jalan/plan_adult1_mealtype3.json', (err, data) => {
    if (err) throw err;
    let hotel = JSON.parse(data);
    console.dir(hotel, { depth: null, colors: true })
    const allPlanDetail = []
    hotel.forEach(async (prefItem) => {
        const medium_area_id = prefItem.medium_area_id;
        const detail_area_id = prefItem.detail_area_id;

        prefItem.products.forEach(async (productItem) => {
            const url =
                "https://www.jalan.net"+ productItem.plan_detail_link;

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
            
            const getTotalYesterdayReserved = $ => $('.jlnpc-yado__notify--inn-reserved').text();

            const crawl = async url => {
                visited.add(url);
                console.log('Crawl: ', url);
                const html = await getHtml(url);
                const $ = cheerio.load(html);
                const content = getTotalYesterdayReserved($);
                console.log(content);
                allPlanDetail.push({
                    "medium_area_id": medium_area_id,
                    "detail_area_id": detail_area_id,
                    "hotel_id": productItem.hotel_id,
                    "hotel_code": productItem.hotel_code,
                    "products": productItem.products,
                    "yesterday_reserved_amount":  content
                })
              
                let data = JSON.stringify(allPlanDetail);
                fs.writeFileSync('../result_jalan/result_plan_detail_adult1_mealtype3.json', data);
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