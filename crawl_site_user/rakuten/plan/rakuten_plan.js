'use strict';

const fs = require('fs');
const axios = require('axios');
const playwright = require('playwright');
const cheerio = require('cheerio');
const { exit } = require('process');
const useHeadless = true; // "true" to use playwright
const maxVisits = 1000; // Arbitrary number for the maximum of links visited
const visited = new Set();

fs.readFile('../result_rakuten/result_rakuten_ranking_mealtype.json', (err, data) => {
    if (err) throw err;
    let hotelPage = JSON.parse(data);
    // console.dir(hotelPage, { depth: null, colors: true })
    const allHotels = []
    hotelPage.forEach(async (prefItem) => {

        prefItem.rank_type.forEach(async (hotelItem) => {
            const url = "https://hotel.travel.rakuten.co.jp/hotelinfo/plan/" + hotelItem.hotel_code + "?f_teikei=&f_heya_su=1&f_otona_su=1&f_s1=0&f_s2=0&f_y1=0&f_y2=0&f_y3=0&f_y4=0&f_kin=&f_kin2=&f_squeezes=breakfast&f_squeezes=dinner&f_tscm_flg=&f_tel=&f_static=1"
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

            const extractContent = $ =>
            $('ul.htlPlnCsst').find('li.planThumb')
                .map((_, plan) => {
                    const $plan = $(plan)
                    // $plan.find('li[data-locate="roomType-chargeByPerson-1"]').find('strong').map((_, product) =>{
                    //     const $product = $(product)
                    return {
                        title: $plan.find('h4').text(),
                        meal_type: "-",
                        adult_amount: $('select[data-locate="searchbox-dh-adult-num"]').find('option[selected="selected"]').text(),
                        yesterday_reserved_amount: $('p.txt').text(),
                    }
                    // }).toArray();
                }).toArray();
            const crawl = async url => {
                visited.add(url);
                console.log('Crawl: ', url);
                const html = await getHtml(url);
                const $ = cheerio.load(html);
                const content = extractContent($)
                // console.log(content);
                allHotels.push({
                    "data": [...content]
                })
                let data = JSON.stringify(allHotels);
                fs.writeFileSync('../result_rakuten/result_rakuten_plan.json', data);
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