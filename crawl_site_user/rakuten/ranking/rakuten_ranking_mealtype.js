'use strict';

const fs = require('fs');
const axios = require('axios');
const playwright = require('playwright');
const cheerio = require('cheerio');
const { exit } = require('process');
const useHeadless = true; // "true" to use playwright
const maxVisits = 1000; // Arbitrary number for the maximum of links visited
const visited = new Set();

fs.readFile('../result_rakuten/result_paging_mealtype.json', (err, data) => {
    if (err) throw err;
    let hotelPage = JSON.parse(data);
    // console.dir(hotelPage, { depth: null, colors: true })
    const allHotels = []
    hotelPage.forEach(async (prefItem) => {
        const medium_area_id = prefItem.f_chu,
            small_area_id = prefItem.f_shou,
            detail_area_id = prefItem.f_sai,
            f_cd = prefItem.f_cd,
            f_hyoji = prefItem.f_hyoji;
        prefItem.list_page.forEach(async (pageItem) => {
            if (detail_area_id != '') {
                var url = "https://search.travel.rakuten.co.jp/ds/undated/search?f_longitude=0&f_shou=" + detail_area_id + "&f_image=1&f_sort_cate=hotel&f_chu=" + medium_area_id
                    + "&f_sort=hotel&f_point_min=0&f_cd=" + f_cd + "&f_latitude=0&f_tab=hotel&f_dai=japan&f_hyoji=" + f_hyoji + "&f_page=" + pageItem + "&f_squeezes=breakfast,dinner";
            }
            else if (small_area_id != '') {
                var url = "https://search.travel.rakuten.co.jp/ds/undated/search?f_longitude=0&f_shou=" + small_area_id + "&f_image=1&f_sort_cate=hotel&f_chu=" + medium_area_id
                    + "&f_sort=hotel&f_point_min=0&f_cd=" + f_cd + "&f_latitude=0&f_tab=hotel&f_dai=japan&f_hyoji=" + f_hyoji + "&f_page=" + pageItem + "&f_squeezes=breakfast,dinner";
            }
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
                $('#htlBox').find('li[data-ratevent="appear"]')
                    .map((_, hotel) => {
                        const $hotel = $(hotel)
                        return {
                            hotel_id: $hotel.find('h1 a').first().attr('href').split('/')[4],
                            hotel_code:  $hotel.find('h1 a').first().attr('href').split('/')[4],
                            hotel_name: $hotel.find('h1 a').first().text(),
                            lhotel_id: $hotel.attr('data-ratid'),
                            hotel_url: $hotel.find('h1 a').first().attr('href'),
                            rank_number: $hotel.find('.cstmrEvl strong').text(),
                            rank: $hotel.index(),
                            adult_amount: $('select[data-locate="searchbox-dh-adult-num"]').find('option[selected="selected"]').text(),
                            // hotel_type: ,
                            // crawl_type:,
                            min_price: $hotel.find('p.htlPrice')?$hotel.find('p.htlPrice').find('span').first().text().replace(/円〜/g, ''):'',
                            crawl_date: Date.now(),
                            meal_type: "-",                        
                            price: $hotel.find('p.htlPrice')?$hotel.find('p.htlPrice').find('span.incldTax').text().replace(/円〜/g, '').replace(/消費税込/g, ''):'',
                        }
                    }).toArray();
            const mergedArray = [];
            const crawl = async url => {
                visited.add(url);
                console.log('Crawl: ', url);
                const html = await getHtml(url);
                const $ = cheerio.load(html);
                const content = extractContent($)

                allHotels.push({
                    "medium_area_id": medium_area_id,
                    "rank_type": [...content]
                })
                                
                let data = JSON.stringify(allHotels);
                fs.writeFileSync('../result_rakuten/result_rakuten_ranking_mealtype.json', data);
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