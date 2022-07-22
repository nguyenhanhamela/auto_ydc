// 'use strict';

const fs = require('fs');
const axios = require('axios');
const playwright = require('playwright');
const cheerio = require('cheerio');
const { exit } = require('process');
const useHeadless = true; // "true" to use playwright
const maxVisits = 1000; // Arbitrary number for the maximum of links visited
const visited = new Set();

fs.readFile('../result_ikyu/ikyu_paging_adult2.json', (err, data) => {
    if (err) throw err;
    let hotelPage = JSON.parse(data);
    // console.dir(hotelPage, { depth: null, colors: true })
    const allHotels = []
    hotelPage.forEach(async(prefItem) => {      
        prefItem.list_page.forEach(async(pageItem) => {
            if (pageItem <= 1) {
                var url = "https://www.ikyu.com/"+ prefItem.medium_area_id + "/" + prefItem.small_area_id + "/?adc=1&asc=01&hoi=1,2&lc=1&mtc=001&per_page=20&pn=1&ppc=" + prefItem.adult_amount + "&rc=1&si=6"
            }
            else if (pageItem > 1) {
                var url = "https://www.ikyu.com/"+ prefItem.medium_area_id + "/" + prefItem.small_area_id + "/p" + pageItem +"/?adc=1&asc=01&hoi=1,2&lc=1&mtc=001&per_page=20&ppc=" + prefItem.adult_amount + "&rc=1&si=6"
            }
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
       
            const extractContent = $ =>
                $('section[itemprop="itemListElement"]')
                    .map((_, hotel) => {
                        const $hotel = $(hotel)
                        return {                            
                            hotel_id:  $hotel.find('.caption_left a').first().attr('href').includes('ca')?  $hotel.find('.caption_left a').first().attr('href').replace(/ca|caz|\/|biz/g, ''):$hotel.find('.caption_left a').first().attr('href'),
                            hotel_code: $hotel.find('.caption_left a').first().attr('href').includes('ca')?  $hotel.find('.caption_left a').first().attr('href').replace('ca', ''):$hotel.find('.caption_left a').first().attr('href'),
                            hotel_url: "https://www.ikyu.com" + $hotel.find('.caption_left a').first().attr('href'),
                            rank_number: $hotel.find('span.pl-1').text(),
                            rank: $hotel.index(),
                            hotel_name:  $hotel.find('h2').text().replace(/\s/g, ''),
                            adult_amount: prefItem.ppc,
                            hotel_type: $hotel.find('a[itemprop="url"]').find('img[itemprop="image"]').attr('alt').includes('ホテル')?'ホテル':$hotel.find('a[itemprop="url"]').find('img[itemprop="image"]').attr('alt').includes('旅館')?'旅館' : $hotel.find('a[itemprop="url"]').find('img[itemprop="image"]').attr('alt'),
                            crawl_type: '-',
                            min_price: $hotel.find('p.promotion').find('.strong').text().replace(/\s/g, ''),
                            crawl_date: Date.now(),
                            meal_type: '-',
                            // detail_area_id: 
                            price: $hotel.find('p.promotion').find('span.originalPrice').text(),
                        }
                }).toArray();
            const mergedArray = [];
            const crawl = async url => {
                // visited.add(url);
                console.log('Crawl: ', url);
                const html = await getHtml(url);
                const $ = cheerio.load(html);
                const content = extractContent($)
                // console.log(content);
                allHotels.push({
                    "medium_area_id": prefItem.medium_area_id,
                    "rank_type": [...content]
                })
                                
                let data = JSON.stringify(allHotels);
                fs.writeFileSync('../result_ikyu/result_ikyu_ranking_meal_type_adult2.json', data);
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