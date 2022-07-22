'use strict';

const fs = require('fs');
const axios = require('axios');
const playwright = require('playwright');
const cheerio = require('cheerio');
const { exit } = require('process');
const useHeadless = true; // "true" to use playwright
const maxVisits = 1000; // Arbitrary number for the maximum of links visited
const visited = new Set();

const allPage = []
let allListPage = []

fs.readFile('../result_rakuten/rakuten_paging.json', (err, data) => {
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
        if (detail_area_id != '') {
            var url =            
                "https://search.travel.rakuten.co.jp/ds/undated/search?f_dai=japan&f_chu="+ medium_area_id 
                +"&f_shou="+ detail_area_id 
                +"&f_sai=&f_cd=&f_ptn=tiku&f_latitude=0.0&f_longitude=0.0&f_layout=&f_sort=hotel&f_rm_equip=&f_hyoji="
                + f_hyoji + "&f_image=1&f_tab=hotel&f_setubi=&f_snow_code=&f_cok=&f_ido=&f_kdo=&f_km=&f_teikei=&f_campaign=&f_disp_type=&f_kin=&f_kin2=&f_landmark_id=&f_squeezes=breakfast&f_squeezes=dinner"
        }
        else if (small_area_id != '') {
            var url =            
                "https://search.travel.rakuten.co.jp/ds/undated/search?f_dai=japan&f_chu="+ medium_area_id 
                +"&f_shou="+ small_area_id 
                +"&f_sai=&f_cd=&f_ptn=tiku&f_latitude=0.0&f_longitude=0.0&f_layout=&f_sort=hotel&f_rm_equip=&f_hyoji="
                + f_hyoji + "&f_image=1&f_tab=hotel&f_setubi=&f_snow_code=&f_cok=&f_ido=&f_kdo=&f_km=&f_teikei=&f_campaign=&f_disp_type=&f_kin=&f_kin2=&f_landmark_id=&f_squeezes=breakfast&f_squeezes=dinner"
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

        const getPaging = $ =>
            $('.paging').first().find('span em').text();

        
        const crawl = async url => {
            visited.add(url);
            console.log('Crawl: ', url);
            const html = await getHtml(url);
            const $ = cheerio.load(html);
            const content = getPaging($)
            let lstPage = []
            let getPage = Math.ceil(content / 30)
            let i = getPage
            while (getPage >= 2) {
                getPage--;
                lstPage.push(getPage)
            }
            let totalPage = lstPage.concat(i);
            allListPage.push({
                "f_chu": medium_area_id, //medium area           
                "f_shou":  small_area_id,
                "f_sai": detail_area_id,  
                "f_cd": f_cd,
                "f_hyoji": f_hyoji,
                "list_page": totalPage
                  
            })
                            
            let data = JSON.stringify(allListPage);
            fs.writeFileSync('../result_rakuten/result_paging_mealtype.json', data);
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
        
    });
});