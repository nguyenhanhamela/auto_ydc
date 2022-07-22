'use strict';

const fs = require('fs');
const axios = require('axios');
const playwright = require('playwright');
const cheerio = require('cheerio');
const { exit } = require('process');
const { get } = require('http');
const useHeadless = true; // "true" to use playwright
const maxVisits = 1000; // Arbitrary number for the maximum of links visited
const visited = new Set();
let allListPage = []

fs.readFile('../result_rakuten/result_rakuten_ranking_mealtype.json', (err, data) => {
    if (err) throw err;
    let hotelPage = JSON.parse(data);
    // console.dir(hotelPage, { depth: null, colors: true })
    const allHotels = []
    hotelPage.forEach(async (prefItem) => {

        prefItem.rank_type.forEach(async (hotelItem) => {
            const url = "https://travel.rakuten.co.jp/HOTEL/" + hotelItem.hotel_code + "/review.html"
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

            const getPaging = $ =>
                $('#primary').find('.pagingArea').first().find('p.pagingTitle em').text();


            const crawl = async url => {                
                console.log('Crawl: ', url);
                const html = await getHtml(url)
                const $ = cheerio.load(html)               
                const content = getPaging($)
                let lstPage = []
                let getPage = Math.ceil(content / 20)                
                let count = 0
                let i = count
                while (getPage >= 2) {
                    getPage--;
                    count+=20
                    lstPage.push(count)
                }
                let totalPage = lstPage.concat(i);
                allListPage.push({
                    "hotel_code": hotelItem.hotel_code,
                    "list_page": totalPage
                    
                })
                let data = JSON.stringify(allListPage);
                fs.writeFileSync('../result_rakuten/rate_paging.json', data);

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