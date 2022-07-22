'use strict';

const fs = require('fs');

const axios = require('axios');
const playwright = require('playwright');
const cheerio = require('cheerio');

const useHeadless = true; // "true" to use playwright
const maxVisits = 1000; // Arbitrary number for the maximum of links visited
const visited = new Set();
const allHotels = [];
const allData = {}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const ikyuUrl = [
    "https://www.ikyu.com/osaka/311031/",
    "https://www.ikyu.com/hakone/160614/"
    // "https://www.ikyu.com/hokuriku/22055303/",
    // "https://www.ikyu.com/tohoku/12022006/",
    // "https://www.ikyu.com/kanto2/15041306/",
    // "https://www.ikyu.com/hokkaido/110140/",
    // "https://www.ikyu.com/chugoku/33085004/",
    // "https://www.ikyu.com/tokai/23060106/",
    // "https://www.ikyu.com/hakone/160615/",
    // "https://www.ikyu.com/kanto2/15042104/",
    // "https://www.ikyu.com/tokyo/140305/",
    // "https://www.ikyu.com/tohoku/12023004/",
    // "https://www.ikyu.com/koshinetsu/21050106/",
    // "https://www.ikyu.com/okinawa/362050/",
    // "https://www.ikyu.com/koshinetsu/21055106/",
    // "https://www.ikyu.com/koshinetsu/21052204/",
    // "https://www.ikyu.com/kanto/13044102/",
    // "https://www.ikyu.com/kyushu/35090105/",
    // "https://www.ikyu.com/hokkaido/110170/",
    // "https://www.ikyu.com/osaka/311081/",
    // "https://www.ikyu.com/tokyo/140304/",
    // "https://www.ikyu.com/chugoku/33082002/",
    // "https://www.ikyu.com/tokai/23060405/",
    // "https://www.ikyu.com/koshinetsu/21050104/",
    // "https://www.ikyu.com/tohoku/12023001/",
    // "https://www.ikyu.com/chugoku/33083003/",
    // "https://www.ikyu.com/tokai/23061203/",
    // "https://www.ikyu.com/tokyo/140302/",
    // "https://www.ikyu.com/tokai/23060102/",
    // "https://www.ikyu.com/chugoku/33084001/",
    // "https://www.ikyu.com/tokai/23060103/",
    // "https://www.ikyu.com/kyoto/320701/",
    // "https://www.ikyu.com/kansai/32070604/",
    // "https://www.ikyu.com/kanto2/15042107/",
    // "https://www.ikyu.com/koshinetsu/21055105/",
    // "https://www.ikyu.com/tohoku/12026003/",
    // "https://www.ikyu.com/tohoku/12022004/",
    // "https://www.ikyu.com/tokyo/140307/",
    // "https://www.ikyu.com/kanto/13040302/",
    // "https://www.ikyu.com/hokuriku/22055603/",
    // "https://www.ikyu.com/kanto2/15042102/",
    // "https://www.ikyu.com/tokyo/140313/",
    // "https://www.ikyu.com/kyushu/35090201/",
    // "https://www.ikyu.com/tohoku/12025005/",
    // "https://www.ikyu.com/tokyo/140308/",
    // "https://www.ikyu.com/tohoku/12026002/",
    // "https://www.ikyu.com/koshinetsu/21055107/",
    // "https://www.ikyu.com/kanto/13044105/",
    // "https://www.ikyu.com/tohoku/12021003/",
    // "https://www.ikyu.com/kanto2/15042103/",
    // "https://www.ikyu.com/kyushu/35090202/",
    // "https://www.ikyu.com/tokyo/140301/",
    // "https://www.ikyu.com/kansai/32070501/",
    // "https://www.ikyu.com/chugoku/33085002/",
    // "https://www.ikyu.com/tokai/23061205/",
    // "https://www.ikyu.com/kyushu/35090103/",
    // "https://www.ikyu.com/kyushu/35090601/",
    // "https://www.ikyu.com/hokuriku/22055402/",
    // "https://www.ikyu.com/kanto/13040602/",
    // "https://www.ikyu.com/hokuriku/22055302/",
    // "https://www.ikyu.com/tokai/23060402/",
    // "https://www.ikyu.com/koshinetsu/21052203/",
    // "https://www.ikyu.com/koshinetsu/21050102/",
    // "https://www.ikyu.com/kanto/13040303/",
    // "https://www.ikyu.com/kanto2/15041304/",
    // "https://www.ikyu.com/tohoku/12023002/",
    // "https://www.ikyu.com/kansai/32070702/",
    // "https://www.ikyu.com/kyushu/35090701/",
    // "https://www.ikyu.com/chugoku/33084002/",
    // "https://www.ikyu.com/tokai/23060302/",
    // "https://www.ikyu.com/kansai/32070703/",
    // "https://www.ikyu.com/kansai/32070701/",
    // "https://www.ikyu.com/hokuriku/22055605/",
    // "https://www.ikyu.com/tokai/23060401/",
    // "https://www.ikyu.com/tohoku/12022002/",
    // "https://www.ikyu.com/hokuriku/22055604/",
    // "https://www.ikyu.com/kanto/13040305/",
    // "https://www.ikyu.com/kansai/32070706/",
    // "https://www.ikyu.com/kanto2/15040504/",
    // "https://www.ikyu.com/kyushu/35090104/",
    // "https://www.ikyu.com/kanto2/15041303/",
    // "https://www.ikyu.com/osaka/311021/",
    // "https://www.ikyu.com/chugoku/33082004/",
    // "https://www.ikyu.com/kansai/32070605/",
    // "https://www.ikyu.com/tokai/23061201/",
    // "https://www.ikyu.com/okinawa/362010/",
    // "https://www.ikyu.com/kyushu/35090101/",
    // "https://www.ikyu.com/osaka/311041/",
    // "https://www.ikyu.com/kanto2/15040505/",
    // "https://www.ikyu.com/kyushu/35090702/",
    // "https://www.ikyu.com/tohoku/12026001/",
    // "https://www.ikyu.com/kyushu/35090206/",
    // "https://www.ikyu.com/kanto2/15042105/",
    // "https://www.ikyu.com/kyushu/35090401/",
    // "https://www.ikyu.com/tohoku/12026006/",
    // "https://www.ikyu.com/kyushu/35090404/",
    // "https://www.ikyu.com/tohoku/12025001/",
    // "https://www.ikyu.com/kansai/32070401/",
    // "https://www.ikyu.com/chugoku/33085003/",
    // "https://www.ikyu.com/chugoku/33081003/",
    // "https://www.ikyu.com/tohoku/12021001/",
    // "https://www.ikyu.com/koshinetsu/21052202/",
    // "https://www.ikyu.com/tokyo/140314/",
    // "https://www.ikyu.com/tokai/23060105/",
    // "https://www.ikyu.com/osaka/311051/",
    // "https://www.ikyu.com/kyushu/35090106/",
    // "https://www.ikyu.com/kyushu/35090503/",
    // "https://www.ikyu.com/kansai/320710/",
    // "https://www.ikyu.com/tohoku/12023005/",
    // "https://www.ikyu.com/kansai/32070402/",
    // "https://www.ikyu.com/kanto/13040603/",
    // "https://www.ikyu.com/tokai/23060403/",
    // "https://www.ikyu.com/shikoku/34089003/",
    // "https://www.ikyu.com/hokuriku/22055403/",
    // "https://www.ikyu.com/tokyo/140312/",
    // "https://www.ikyu.com/kyushu/35090203/",
    // "https://www.ikyu.com/shikoku/34087002/",
    // "https://www.ikyu.com/kanto2/15041301/",
    // "https://www.ikyu.com/tohoku/12025004/",
    // "https://www.ikyu.com/kanto/13040604/",
    // "https://www.ikyu.com/tohoku/12022001/",
    // "https://www.ikyu.com/tokai/23060301/",
    // "https://www.ikyu.com/kyushu/35090407/",
    // "https://www.ikyu.com/chugoku/33082005/",
    // "https://www.ikyu.com/koshinetsu/21050101/",
    // "https://www.ikyu.com/kyushu/35090303/",
    // "https://www.ikyu.com/kyushu/35090604/",
    // "https://www.ikyu.com/tokai/23061204/",
    // "https://www.ikyu.com/tohoku/12022005/",
    // "https://www.ikyu.com/tohoku/12024003/",
    // "https://www.ikyu.com/hokkaido/110120/",
    // "https://www.ikyu.com/chugoku/33083002/",
    // "https://www.ikyu.com/chugoku/33084004/",
    // "https://www.ikyu.com/kyushu/35090703/",
    // "https://www.ikyu.com/tokyo/140309/",
    // "https://www.ikyu.com/shikoku/34089002/",
    // "https://www.ikyu.com/kanto2/15040501/",
    // "https://www.ikyu.com/chugoku/33082001/",
    // "https://www.ikyu.com/koshinetsu/21055101/",
    // "https://www.ikyu.com/kanto2/15040502/",
    // "https://www.ikyu.com/tohoku/12025003/",
    // "https://www.ikyu.com/tohoku/12026005/",
    // "https://www.ikyu.com/tokyo/140310/",
    // "https://www.ikyu.com/kyushu/35090504/",
    // "https://www.ikyu.com/tohoku/12023003/",
    // "https://www.ikyu.com/chugoku/33083001/",
    // "https://www.ikyu.com/hokkaido/110130/",
    // "https://www.ikyu.com/chugoku/33085001/",
    // "https://www.ikyu.com/kanto/13044104/",
    // "https://www.ikyu.com/tohoku/12024005/",
    // "https://www.ikyu.com/tohoku/12024001/",
    // "https://www.ikyu.com/shikoku/34088002/",
    // "https://www.ikyu.com/hokuriku/22055602/",
    // "https://www.ikyu.com/kanto/13040304/",
    // "https://www.ikyu.com/kanto2/15042106/",
    // "https://www.ikyu.com/kyushu/35090403/",
    // "https://www.ikyu.com/kanto2/15041302/",
    // "https://www.ikyu.com/tokai/23060303/",
    // "https://www.ikyu.com/kyushu/35090405/",
    // "https://www.ikyu.com/kyushu/35090505/",
    // "https://www.ikyu.com/kanto2/15042101/",
    // "https://www.ikyu.com/kanto/13040605/",
    // "https://www.ikyu.com/tokyo/140306/",
    // "https://www.ikyu.com/osaka/311091/",
    // "https://www.ikyu.com/kansai/32070404/",
    // "https://www.ikyu.com/chugoku/33081004/",
    // "https://www.ikyu.com/kanto2/15042108/",
    // "https://www.ikyu.com/kanto/13040306/",
    // "https://www.ikyu.com/hokkaido/110160/",
    // "https://www.ikyu.com/tokai/23060404/",
    // "https://www.ikyu.com/koshinetsu/21052208/",
    // "https://www.ikyu.com/kansai/32070403/",
    // "https://www.ikyu.com/hokuriku/22055601/",
    // "https://www.ikyu.com/koshinetsu/21052207/",
    // "https://www.ikyu.com/chugoku/33084003/",
    // "https://www.ikyu.com/kansai/32070503/",
    // "https://www.ikyu.com/tohoku/12022003/",
    // "https://www.ikyu.com/koshinetsu/21055102/",
    // "https://www.ikyu.com/kanto/13040301/",
    // "https://www.ikyu.com/tohoku/12025002/",
    // "https://www.ikyu.com/tohoku/12024004/",
    // "https://www.ikyu.com/kyushu/35090502/",
    // "https://www.ikyu.com/koshinetsu/21050105/",
    // "https://www.ikyu.com/kyushu/35090205/",
    // "https://www.ikyu.com/tohoku/12021005/",
    // "https://www.ikyu.com/koshinetsu/21052201/",
    // "https://www.ikyu.com/kanto/13044103/",
    // "https://www.ikyu.com/kyushu/35090506/",
    // "https://www.ikyu.com/hokuriku/22055404/",
    // "https://www.ikyu.com/kyushu/35090603/",
    // "https://www.ikyu.com/tohoku/12021002/",
    // "https://www.ikyu.com/kansai/32070705/",
    // "https://www.ikyu.com/tohoku/12026004/",
    // "https://www.ikyu.com/tokai/23061202/",
    // "https://www.ikyu.com/tohoku/12021004/",
    // "https://www.ikyu.com/hakone/160417/",
    // "https://www.ikyu.com/hokkaido/110110/",
    // "https://www.ikyu.com/hokuriku/22055401/",
    // "https://www.ikyu.com/kanto2/15041305/",
    // "https://www.ikyu.com/kansai/32070601/",
    // "https://www.ikyu.com/kyushu/35090406/",
    // "https://www.ikyu.com/osaka/311061/",
    // "https://www.ikyu.com/chugoku/33082003/",
    // "https://www.ikyu.com/shikoku/34087003/",
    // "https://www.ikyu.com/kyushu/35090705/",
    // "https://www.ikyu.com/shikoku/34089001/",
    // "https://www.ikyu.com/kanto/13044101/",
    // "https://www.ikyu.com/osaka/311071/",
    // "https://www.ikyu.com/kyushu/35090706/",
    // "https://www.ikyu.com/chugoku/33081002/",
    // "https://www.ikyu.com/kansai/32070502/",
    // "https://www.ikyu.com/tokyo/140311/",
    // "https://www.ikyu.com/kansai/32070603/",
    // "https://www.ikyu.com/tokai/23060101/",
    // "https://www.ikyu.com/kyushu/35090204/",
    // "https://www.ikyu.com/tokyo/140303/",
    // "https://www.ikyu.com/shikoku/34088004/",
    // "https://www.ikyu.com/koshinetsu/21052205/",
    // "https://www.ikyu.com/shikoku/34088003/",
    // "https://www.ikyu.com/shikoku/34086002/",
    // "https://www.ikyu.com/hokuriku/22055301/",
    // "https://www.ikyu.com/koshinetsu/21055104/",
    // "https://www.ikyu.com/hakone/160418/",
    // "https://www.ikyu.com/kanto/13040601/",
    // "https://www.ikyu.com/osaka/311011/",
    // "https://www.ikyu.com/koshinetsu/21050103/",
    // "https://www.ikyu.com/tokai/23060304/",
    // "https://www.ikyu.com/koshinetsu/21055103/",
    // "https://www.ikyu.com/chugoku/33081001/",
    // "https://www.ikyu.com/kansai/32070602/",
    // "https://www.ikyu.com/kyushu/35090102/",
    // "https://www.ikyu.com/kanto2/15040503/",
    // "https://www.ikyu.com/kansai/32070707/",
    // "https://www.ikyu.com/kansai/32070704/",
    // "https://www.ikyu.com/shikoku/34086001/",
    // "https://www.ikyu.com/shikoku/34088001/",
    // "https://www.ikyu.com/kyushu/35090704/",
    // "https://www.ikyu.com/hokkaido/110150/",
    // "https://www.ikyu.com/kyushu/35090602/",
    // "https://www.ikyu.com/kyushu/35090501/",
    // "https://www.ikyu.com/kyushu/35090302/",
    // "https://www.ikyu.com/tokai/23060104/",
    // "https://www.ikyu.com/kanto2/15040506/",
    // "https://www.ikyu.com/kyushu/35090402/",
    // "https://www.ikyu.com/shikoku/34086003/",
    // "https://www.ikyu.com/shikoku/34087001/",
    // "https://www.ikyu.com/koshinetsu/21052206/",
    // "https://www.ikyu.com/kyushu/35090301/",
    // "https://www.ikyu.com/tohoku/12024002/"
]
const allPage = []
let allListPage = []
ikyuUrl.forEach(async(urlLink) => {
    const medium_area_id = urlLink.split('/')[3]
    const small_area_id = urlLink.split('/')[4]
    const ppc = 1;
    /*
    * Steps:
    - Lay ra prefecture va small area
    1. get total records
    2. lay total records / 30
    - Neu <= 1 => lay tong so ban ghi
    - Neu > 1 => lam tron len (vi du: 725 / 30 = 24.167 ~ 25 => luu vao pager tu 2 den 25)
    3. Click url: tu 1 den 25: https://search.travel.rakuten.co.jp/ds/ + prefecture_name/small_name/small_name-p + page
    4. Noi 2 mang: page 1 va cac page con lai
    */
    const url = "https://www.ikyu.com/" + medium_area_id + "/" + small_area_id + "/?adc=1&asc=01&hoi=1,2&lc=1&mtc=001&per_page=20&pn=1&ppc=" + ppc + "&rc=1&si=6"
    const wait = async (time) =>
    new Promise((res, rej) => setTimeout(() => res(), time));    
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
        page.waitForTimeout(30000)
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

    // const getPaging = $ =>
    //     $('.pagination').find('li').map((_, page) => {
    //         const $page = $(page);
    //         return {
    //             // page: $page.find('a.anchor_3-0dj').text(),
    //             page: $page.find('a').attr('href'),
    //         }
    //     }).toArray();

    const getPaging = $ => 
        $('nav.justify-between').find('strong.block').find('span.counter_1UcpH').text();

    const crawl = async url => {
        visited.add(url);
        console.log('Crawl: ', url);
        const html = await getHtml(url);
        const $ = cheerio.load(html);
        const content = getPaging($)
        console.log(content);
        allPage.push(content)
        let lstPage = []
        let getPage = Math.ceil(content / 20)
        let i = getPage
        while (getPage >= 2) {
            getPage--;          
            lstPage.push(getPage)
        }
        let totalPage = lstPage.concat(i);
        allListPage.push({
            "medium_area_id": medium_area_id,
            "small_area_id": small_area_id,
            "adult_amount": ppc,
            "list_page": totalPage
        })

        let data = JSON.stringify(allListPage);
        fs.writeFileSync('../result_ikyu/ikyu_paging_adult1.json', data);
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

