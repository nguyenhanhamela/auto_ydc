// 'use strict';

const fs = require("fs");

const axios = require("axios");
const playwright = require("playwright");
const cheerio = require("cheerio");
const useHeadless = true; // "true" to use playwright
const maxVisits = 1000; // Arbitrary number for the maximum of links visited
const visited = new Set();
const allHotels = [];
const allData = {};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

fs.readFile("../result_jalan/result_rank_adult1.json", (err, data) => {
    if (err) throw err;
    let hotel = JSON.parse(data);
    // console.dir(hotel, { depth: null, colors: true })
    const allHotels = [];
    hotel.forEach(async (prefItem) => {
        const mealType = 1;
        const medium_area_id = prefItem.medium_area_id;
        const detail_area_id = prefItem.detail_area_id;
        prefItem.pagination.forEach(async (pageItem) => {
            const url =
                "https://www.jalan.net/" +
                prefItem.medium_area_id +
                "/LRG_" +
                prefItem.detail_area_id +
                "/page" +
                pageItem +
                ".html?stayYear=&stayMonth=&stayDay=&dateUndecided=1&stayCount=1&roomCount=1&adultNum=" +
                prefItem.adult_amount +
                "&minPrice=0&maxPrice=999999&mealType=" +
                mealType +
                "&contHideFlg=1&kenCd=" +
                prefItem.medium_area_id +
                "&lrgCd=" +
                prefItem.detail_area_id +
                "&rootCd=041&distCd=01&roomCrack=200000&reShFlg=1&mvTabFlg=0&listId=" +
                prefItem.areaListId +
                "&childPriceFlg=0,0,0,0,0&screenId=UWW1402";
            const getHtmlPlaywright = async (url) => {
                const browser = await playwright.chromium.launch();
                const context = await browser.newContext();
                const page = await context.newPage();
                await page.goto(url, {
                    waitUntil: "load",
                    // Remove the timeout
                    timeout: 0,
                });
                const html = await page.content();
                await browser.close();

                return html;
            };

            const getHtmlAxios = async (url) => {
                const { data } = await axios.get(url);

                return data;
            };

            const getHtml = async (url) => {
                return useHeadless
                    ? await getHtmlPlaywright(url)
                    : await getHtmlAxios(url);
            };

            const extractContent = ($) =>
                $("#jsiInnList")
                    .find("li.p-yadoCassette")
                    .map((_, hotel) => {
                        const $hotel = $(hotel);
                        return {
                            hotel_id: $hotel.attr("id").split("yadNo")[1],
                            hotel_code: $hotel.attr("id"),
                            hotel_name: $hotel
                                .find(".p-searchResultItem__facilityName")
                                .text(),
                            adult_amount: prefItem.adult_amount,
                            meal_type: mealType,
                            min_price: $hotel
                                .find(".p-searchResultItem__lowestPriceValue")
                                .text()
                                .replace(/円～/g, ""),
                            rank_number: $hotel.index(),
                            pageListNumArea: $hotel
                                .find("a.jlnpc-yadoCassette__link")
                                .attr("data-onclick")
                                .split(",")[1]
                                .replace(/'/g, ""),
                            pageListNumYad: $hotel
                                .find("a.jlnpc-yadoCassette__link")
                                .attr("data-onclick")
                                .split(",")[2]
                                .split(");")[0]
                                .replace(/'/g, ""),
                        };
                    })
                    .toArray();

            const crawl = async (url) => {
                visited.add(url);
                console.log("Crawl: ", url);
                const html = await getHtml(url);
                const $ = cheerio.load(html);
                const content = extractContent($);
                allHotels.push({
                    medium_area_id: medium_area_id,
                    detail_area_id: detail_area_id,
                    smlCd: $('#smallAreaUl_ana li').first().find('a').attr('onclick').split(',')[1].replace(/'/g, ''),
                    hotelList: [...content],
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
                        output[existingIndex].hotelList = output[existingIndex].hotelList.concat(item.hotelList);
                    } else {
                        if (typeof item.hotelList == 'string')
                        item.hotelList = [item.hotelList];
                        output.push(item);
                    }
                    });
                }
                
                // console.log(output);               

                let data = JSON.stringify(output);
                fs.writeFileSync("../result_jalan/result_adult1_mealtype1.json", data);
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

            const crawlTask = async (url) => {
                if (visited.size >= maxVisits) {
                    console.log("Over Max Visits, exiting");
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
});
