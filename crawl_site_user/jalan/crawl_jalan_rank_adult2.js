// 'use strict';

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

const jalanUrl = [
    "https://www.jalan.net/020000/LRG_020900/",
    "https://www.jalan.net/030000/LRG_030100/"
    // "https://www.jalan.net/020000/LRG_020800/"
    // "https://www.jalan.net/020000/LRG_021400/",
    // "https://www.jalan.net/060000/LRG_060500/",
    // "https://www.jalan.net/030000/LRG_030300/",
    // "https://www.jalan.net/070000/LRG_071600/",
    // "https://www.jalan.net/090000/LRG_092000/",
    // "https://www.jalan.net/100000/LRG_100200/",
    // "https://www.jalan.net/130000/LRG_137100/",
    // "https://www.jalan.net/130000/LRG_138000/",
    // "https://www.jalan.net/020000/LRG_020500/",
    // "https://www.jalan.net/020000/LRG_020200/",
    // "https://www.jalan.net/040000/LRG_040800/",
    // "https://www.jalan.net/020000/LRG_021700/",
    // "https://wwwwww.jalan.net/050000/LRG_050200/",
    // "https://wwwwww.jalan.net/050000/LRG_050300/",
    // "https://wwwwww.jalan.net/050000/LRG_050800/",
    // "https://wwwwww.jalan.net/050000/LRG_050500/",
    // "https://wwwwww.jalan.net/050000/LRG_051100/",
    // "https://www.jalan.net/060000/LRG_060200/",
    // "https://www.jalan.net/060000/LRG_061400/",
    // "https://www.jalan.net/060000/LRG_061100/",
    // "https://www.jalan.net/060000/LRG_060800/",
    // "https://www.jalan.net/030000/LRG_031100/",
    // "https://www.jalan.net/030000/LRG_030800/",
    // "https://www.jalan.net/030000/LRG_030200/",
    // "https://www.jalan.net/070000/LRG_070200/",
    // "https://www.jalan.net/070000/LRG_072500/",
    // "https://www.jalan.net/070000/LRG_073200/",
    // "https://www.jalan.net/070000/LRG_071500/",
    // "https://www.jalan.net/070000/LRG_071700/",
    // "https://www.jalan.net/070000/LRG_072800/",
    // "https://www.jalan.net/070000/LRG_071100/",
    // "https://www.jalan.net/070000/LRG_072000/",
    // "https://www.jalan.net/090000/LRG_090300/",
    // "https://www.jalan.net/090000/LRG_091400/",
    // "https://www.jalan.net/090000/LRG_090200/",
    // "https://www.jalan.net/090000/LRG_090400/",
    // "https://www.jalan.net/090000/LRG_091100/",
    // "https://www.jalan.net/090000/LRG_090500/",
    // "https://www.jalan.net/090000/LRG_090800/",
    // "https://www.jalan.net/090000/LRG_090100/",
    // "https://www.jalan.net/080000/LRG_080200/",
    // "https://www.jalan.net/080000/LRG_080800/",
    // "https://www.jalan.net/080000/LRG_080500/",
    // "https://www.jalan.net/080000/LRG_081100/",
    // "https://www.jalan.net/080000/LRG_080900/",
    // "https://www.jalan.net/080000/LRG_080600/",
    // "https://www.jalan.net/080000/LRG_081600/",
    // "https://www.jalan.net/100000/LRG_101400/",
    // "https://www.jalan.net/100000/LRG_100500/",
    // "https://www.jalan.net/100000/LRG_101100/",
    // "https://www.jalan.net/100000/LRG_100800/",
    // "https://www.jalan.net/100000/LRG_100600/",
    // "https://www.jalan.net/110000/LRG_110200/",
    // "https://www.jalan.net/110000/LRG_111400/",
    // "https://www.jalan.net/110000/LRG_111700/",
    // "https://www.jalan.net/110000/LRG_110500/",
    // "https://www.jalan.net/110000/LRG_111100/",
    // "https://www.jalan.net/110000/LRG_110800/",
    // "https://www.jalan.net/030000/LRG_030500/",
    // "https://www.jalan.net/130000/LRG_136800/",
    // "https://www.jalan.net/130000/LRG_138600/",
    // "https://www.jalan.net/130000/LRG_136500/",
    // "https://www.jalan.net/130000/LRG_139500/",
    // "https://www.jalan.net/130000/LRG_138900/",
    // "https://www.jalan.net/130000/LRG_139800/",
    // "https://www.jalan.net/140000/LRG_140200/",
    // "https://www.jalan.net/140000/LRG_141600/",
    // "https://www.jalan.net/140000/LRG_140800/",
    // "https://www.jalan.net/140000/LRG_140100/",
    // "https://www.jalan.net/140000/LRG_141700/",
    // "https://www.jalan.net/140000/LRG_140500/",
    // "https://www.jalan.net/140000/LRG_141100/",
    // "https://www.jalan.net/140000/LRG_141400/",
    // "https://www.jalan.net/140000/LRG_142000/",
    // "https://www.jalan.net/120000/LRG_120800/",
    // "https://www.jalan.net/120000/LRG_120200/",
    // "https://www.jalan.net/120000/LRG_121100/",
    // "https://www.jalan.net/120000/LRG_122300/",
    // "https://www.jalan.net/120000/LRG_122000/",
    // "https://www.jalan.net/120000/LRG_122600/",
    // "https://www.jalan.net/120000/LRG_121700/",
    // "https://www.jalan.net/120000/LRG_121400/",
    // "https://www.jalan.net/170000/LRG_170200/",
    // "https://www.jalan.net/170000/LRG_171700/",
    // "https://www.jalan.net/170000/LRG_171400/",
    // "https://www.jalan.net/170000/LRG_172000/",
    // "https://www.jalan.net/170000/LRG_170600/",
    // "https://www.jalan.net/170000/LRG_171300/",
    // "https://www.jalan.net/170000/LRG_170500/",
    // "https://www.jalan.net/160000/LRG_160200/",
    // "https://www.jalan.net/160000/LRG_162300/",
    // "https://www.jalan.net/160000/LRG_161900/",
    // "https://www.jalan.net/160000/LRG_162600/",
    // "https://www.jalan.net/160000/LRG_162200/",
    // "https://www.jalan.net/160000/LRG_161800/",
    // "https://www.jalan.net/160000/LRG_162000/",
    // "https://www.jalan.net/160000/LRG_160500/",
    // "https://www.jalan.net/160000/LRG_162400/",
    // "https://www.jalan.net/160000/LRG_160800/",
    // "https://www.jalan.net/160000/LRG_160900/",
    // "https://www.jalan.net/160000/LRG_163500/",
    // "https://www.jalan.net/160000/LRG_161600/",
    // "https://www.jalan.net/160000/LRG_163200/",
    // "https://www.jalan.net/160000/LRG_160600/",
    // "https://www.jalan.net/160000/LRG_161100/",
    // "https://www.jalan.net/150000/LRG_150600/",
    // "https://www.jalan.net/150000/LRG_150100/",
    // "https://www.jalan.net/150000/LRG_150500/",
    // "https://www.jalan.net/150000/LRG_150800/",
    // "https://www.jalan.net/150000/LRG_150200/",
    // "https://www.jalan.net/150000/LRG_151100/",
    // "https://www.jalan.net/220000/LRG_221100/",
    // "https://www.jalan.net/220000/LRG_220200/",
    // "https://www.jalan.net/220000/LRG_220500/",
    // "https://www.jalan.net/220000/LRG_220600/",
    // "https://www.jalan.net/220000/LRG_221500/",
    // "https://www.jalan.net/220000/LRG_220300/",
    // "https://www.jalan.net/210000/LRG_210200/",
    // "https://www.jalan.net/210000/LRG_212600/",
    // "https://www.jalan.net/210000/LRG_212300/",
    // "https://www.jalan.net/210000/LRG_210400/",
    // "https://www.jalan.net/210000/LRG_212000/",
    // "https://www.jalan.net/210000/LRG_213700/",
    // "https://www.jalan.net/210000/LRG_212900/",
    // "https://www.jalan.net/210000/LRG_211000/",
    // "https://www.jalan.net/180000/LRG_180500/",
    // "https://www.jalan.net/180000/LRG_180200/",
    // "https://www.jalan.net/180000/LRG_180800/",
    // "https://www.jalan.net/190000/LRG_192000/",
    // "https://www.jalan.net/190000/LRG_192600/",
    // "https://www.jalan.net/190000/LRG_191100/",
    // "https://www.jalan.net/190000/LRG_191400/",
    // "https://www.jalan.net/190000/LRG_192300/",
    // "https://www.jalan.net/250000/LRG_250500/",
    // "https://www.jalan.net/250000/LRG_250200/",
    // "https://www.jalan.net/250000/LRG_251400/",
    // "https://www.jalan.net/250000/LRG_251700/",
    // "https://www.jalan.net/250000/LRG_250800/",
    // "https://www.jalan.net/250000/LRG_251100/",
    // "https://www.jalan.net/260000/LRG_260500/",
    // "https://www.jalan.net/260000/LRG_264200/",
    // "https://www.jalan.net/260000/LRG_264800/",
    // "https://www.jalan.net/260000/LRG_262000/",
    // "https://www.jalan.net/260000/LRG_262300/",
    // "https://www.jalan.net/210000/LRG_213500/",
    // "https://www.jalan.net/260000/LRG_261400/",
    // "https://www.jalan.net/260000/LRG_264500/",
    // "https://www.jalan.net/270000/LRG_271700/",
    // "https://www.jalan.net/270000/LRG_272900/",
    // "https://www.jalan.net/270000/LRG_271400/",
    // "https://www.jalan.net/270000/LRG_273200/",
    // "https://www.jalan.net/270000/LRG_273800/",
    // "https://www.jalan.net/270000/LRG_272600/",
    // "https://www.jalan.net/270000/LRG_273500/",
    // "https://www.jalan.net/270000/LRG_272300/",
    // "https://www.jalan.net/280000/LRG_280200/",
    // "https://www.jalan.net/280000/LRG_280500/",
    // "https://www.jalan.net/280000/LRG_281700/",
    // "https://www.jalan.net/280000/LRG_280800/",
    // "https://www.jalan.net/280000/LRG_281100/",
    // "https://www.jalan.net/280000/LRG_281400/",
    // "https://www.jalan.net/280000/LRG_281200/",
    // "https://www.jalan.net/290000/LRG_290500/",
    // "https://www.jalan.net/290000/LRG_290800/",
    // "https://www.jalan.net/300000/LRG_300200/",
    // "https://www.jalan.net/300000/LRG_301000/",
    // "https://www.jalan.net/300000/LRG_301100/",
    // "https://www.jalan.net/300000/LRG_300500/",
    // "https://www.jalan.net/300000/LRG_300300/",
    // "https://www.jalan.net/300000/LRG_300800/",
    // "https://www.jalan.net/310000/LRG_310800/",
    // "https://www.jalan.net/310000/LRG_310200/",
    // "https://www.jalan.net/310000/LRG_310500/",
    // "https://www.jalan.net/320000/LRG_320500/",
    // "https://www.jalan.net/320000/LRG_320400/",
    // "https://www.jalan.net/320000/LRG_320800/",
    // "https://www.jalan.net/330000/LRG_330200/",
    // "https://www.jalan.net/330000/LRG_330500/",
    // "https://www.jalan.net/330000/LRG_330800/",
    // "https://www.jalan.net/330000/LRG_331100/",
    // "https://www.jalan.net/340000/LRG_340900/",
    // "https://www.jalan.net/340000/LRG_340300/",
    // "https://www.jalan.net/340000/LRG_341100/",
    // "https://www.jalan.net/340000/LRG_340600/",
    // "https://www.jalan.net/350000/LRG_351300/",
    // "https://www.jalan.net/350000/LRG_350600/",
    // "https://www.jalan.net/350000/LRG_351000/",
    // "https://www.jalan.net/360000/LRG_360200/",
    // "https://www.jalan.net/360000/LRG_360500/",
    // "https://www.jalan.net/360000/LRG_360800/",
    // "https://www.jalan.net/370000/LRG_370200/",
    // "https://www.jalan.net/370000/LRG_370800/",
    // "https://www.jalan.net/380000/LRG_380200/",
    // "https://www.jalan.net/380000/LRG_380500/",
    // "https://www.jalan.net/380000/LRG_380800/",
    // "https://www.jalan.net/380000/LRG_381100/",
    // "https://www.jalan.net/390000/LRG_390800/",
    // "https://www.jalan.net/390000/LRG_390500/",
    // "https://www.jalan.net/400000/LRG_400100/",
    // "https://www.jalan.net/400000/LRG_400500/",
    // "https://www.jalan.net/400000/LRG_400800/",
    // "https://www.jalan.net/400000/LRG_400300/",
    // "https://www.jalan.net/400000/LRG_400400/",
    // "https://www.jalan.net/410000/LRG_410200/",
    // "https://www.jalan.net/410000/LRG_411100/",
    // "https://www.jalan.net/410000/LRG_411300/",
    // "https://www.jalan.net/410000/LRG_410500/",
    // "https://www.jalan.net/410000/LRG_410800/",
    // "https://www.jalan.net/420000/LRG_420600/",
    // "https://www.jalan.net/420000/LRG_420200/",
    // "https://www.jalan.net/420000/LRG_420800/",
    // "https://www.jalan.net/420000/LRG_421400/",
    // "https://www.jalan.net/420000/LRG_420500/",
    // "https://www.jalan.net/420000/LRG_421100/",
    // "https://www.jalan.net/430000/LRG_430200/",
    // "https://www.jalan.net/430000/LRG_430500/",
    // "https://www.jalan.net/430000/LRG_430800/",
    // "https://www.jalan.net/430000/LRG_430900/",
    // "https://www.jalan.net/430000/LRG_430300/",
    // "https://www.jalan.net/430000/LRG_430400/",
    // "https://www.jalan.net/440000/LRG_440500/",
    // "https://www.jalan.net/440000/LRG_440200/",
    // "https://www.jalan.net/440000/LRG_441100/",
    // "https://www.jalan.net/450000/LRG_450200/",
    // "https://www.jalan.net/450000/LRG_450500/",
    // "https://www.jalan.net/450000/LRG_450300/",
    // "https://www.jalan.net/460000/LRG_460200/",
    // "https://www.jalan.net/460000/LRG_461100/",
    // "https://www.jalan.net/460000/LRG_460500/",
    // "https://www.jalan.net/460000/LRG_461400/",
    // "https://www.jalan.net/460000/LRG_460800/",
    // "https://www.jalan.net/460000/LRG_461700/",
    // "https://www.jalan.net/130000/LRG_136200/",
    // "https://www.jalan.net/130000/LRG_137400/",
    // "https://www.jalan.net/130000/LRG_137700/",
    // "https://www.jalan.net/120000/LRG_120500/",
    // "https://www.jalan.net/170000/LRG_171100/",
    // "https://www.jalan.net/160000/LRG_161400/",
    // "https://www.jalan.net/150000/LRG_151400/",
    // "https://www.jalan.net/150000/LRG_150300/",
    // "https://www.jalan.net/220000/LRG_220800/",
    // "https://www.jalan.net/200000/LRG_200300/",
    // "https://www.jalan.net/200000/LRG_200200/",
    // "https://www.jalan.net/200000/LRG_200500/",
    // "https://www.jalan.net/260000/LRG_263300/",
    // "https://www.jalan.net/270000/LRG_272000/",
    // "https://www.jalan.net/290000/LRG_290200/",
    // "https://www.jalan.net/320000/LRG_320100/",
    // "https://www.jalan.net/350000/LRG_350300/",
    // "https://www.jalan.net/390000/LRG_390200/",
    // "https://www.jalan.net/400000/LRG_400600/",
    // "https://www.jalan.net/430000/LRG_431100/",
    // "https://www.jalan.net/440000/LRG_440600/",
    // "https://www.jalan.net/440000/LRG_440800/",
    // "https://www.jalan.net/440000/LRG_441400/",
    // "https://www.jalan.net/020000/LRG_021100/",
    // "https://www.jalan.net/130000/LRG_138300/",
    // "https://www.jalan.net/130000/LRG_139200/",
    // "https://www.jalan.net/260000/LRG_260200/",
    // "https://www.jalan.net/260000/LRG_263900/",
    // "https://www.jalan.net/010000/LRG_010200/",
    // "https://www.jalan.net/010000/LRG_010300/",
    // "https://www.jalan.net/010000/LRG_010500/",
    // "https://www.jalan.net/010000/LRG_010800/",
    // "https://www.jalan.net/010000/LRG_011100/",
    // "https://www.jalan.net/010000/LRG_011400/",
    // "https://www.jalan.net/010000/LRG_011700/",
    // "https://www.jalan.net/010000/LRG_012000/",
    // "https://www.jalan.net/010000/LRG_012100/",
    // "https://www.jalan.net/010000/LRG_012300/",
    // "https://www.jalan.net/010000/LRG_012600/",
    // "https://www.jalan.net/010000/LRG_012900/",
    // "https://www.jalan.net/010000/LRG_013200/",
    // "https://www.jalan.net/010000/LRG_013300/",
    // "https://www.jalan.net/010000/LRG_013500/",
    // "https://www.jalan.net/040000/LRG_040200/",
    // "https://www.jalan.net/040000/LRG_041100/",
    // "https://www.jalan.net/040000/LRG_040500/",
    // "https://www.jalan.net/040000/LRG_041400/",
    // "https://www.jalan.net/040000/LRG_041200/",
    // "https://www.jalan.net/210000/LRG_210500/",
    // "https://www.jalan.net/210000/LRG_211400/",
    // "https://www.jalan.net/210000/LRG_211100/",
    // "https://www.jalan.net/210000/LRG_213200/",
    // "https://www.jalan.net/210000/LRG_210800/",
    // "https://www.jalan.net/210000/LRG_211700/",
    // "https://www.jalan.net/230000/LRG_230200/",
    // "https://www.jalan.net/230000/LRG_230800/",
    // "https://www.jalan.net/230000/LRG_231100/",
    // "https://www.jalan.net/230000/LRG_230500/",
    // "https://www.jalan.net/240000/LRG_240200/",
    // "https://www.jalan.net/240000/LRG_241100/",
    // "https://www.jalan.net/240000/LRG_240800/",
    // "https://www.jalan.net/240000/LRG_241400/",
    // "https://www.jalan.net/240000/LRG_240500/",
    // "https://www.jalan.net/240000/LRG_241000/",
    // "https://www.jalan.net/240000/LRG_241300/",
    // "https://www.jalan.net/240000/LRG_241700/",
    // "https://www.jalan.net/240000/LRG_242000/",
    // "https://www.jalan.net/470000/LRG_470200/",
    // "https://www.jalan.net/470000/LRG_471400/",
    // "https://www.jalan.net/470000/LRG_470500/",
    // "https://www.jalan.net/470000/LRG_471100/",
    // "https://www.jalan.net/470000/LRG_471700/",
    // "https://www.jalan.net/470000/LRG_470800/"
];

// const splitUrl = jalanUrl[0].split('/')
// const kenCd = splitUrl[3]
// const lrgCd = splitUrl[4].slice(4, splitUrl[4].length)
// console.log(lrgCd)
// const jalanUrlFix = "?stayYear=&stayMonth=&stayDay=&dateUndecided=1&stayCount=1&roomCount=1&adultNum=2&minPrice=0&maxPrice=999999&mealType=&kenCd=" + kenCd+
// "&lrgCd=" + lrgCd+ "&distCd=01&roomCrack=200000&reShFlg=1&mvTabFlg=0&listId=6&screenId=UWW1402";

// const url = jalanUrl[0] + jalanUrlFix;
const planListId = 'https://www.jalan.net/yad377736/plan/?screenId=UWW3001&yadNo=377736&contHideFlg=1&roomCount=1&adultNum=2&dateUndecided=1&roomCrack=200000&stayCount=1&smlCd=020902&distCd=01&ccnt=yads2'

jalanUrl.forEach(async (urllink) => {
    const splitUrl = urllink.split('/')
    const kenCd = splitUrl[3]
    const lrgCd = splitUrl[4].slice(4, splitUrl[4].length)
    // console.log(lrgCd)
    const adultNum = 2
    const jalanUrlFix = "?stayYear=&stayMonth=&stayDay=&dateUndecided=1&stayCount=1&roomCount=1&adultNum=" + adultNum + "&minPrice=0&maxPrice=999999&mealType=&kenCd=" + kenCd +
        "&lrgCd=" + lrgCd + "&distCd=01&roomCrack=200000&reShFlg=1&mvTabFlg=0&listId=6&screenId=UWW1402";

    const url = urllink + jalanUrlFix;

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

    const extractContent = $ =>
        // [...new Set(
        $('#jsiInnList').find('li.p-yadoCassette')
            .map((_, hotel) => {
                const $hotel = $(hotel);
                return {
                    hotel_id: $hotel.attr('id').split('yadNo')[1],
                    hotel_code: $hotel.attr('id'),
                    hotel_name: $hotel.find('.p-searchResultItem__facilityName').text(),
                    adult_amount: adultNum,
                    min_price: $hotel.find('.p-searchResultItem__lowestPriceValue').text().replace(/円～/g, ''),
                    // medium_area_id: kenCd,
                    // detail_area_id: lrgCd,
                    rank_number: $hotel.index()
                };
            })
            .toArray()
    // ),]

    const crawl = async url => {
        console.log('Crawl: ', url);
        const html = await getHtml(url);
        const $ = cheerio.load(html);
        const content = extractContent($);
        allHotels.push({
            "medium_area_id": kenCd,
            "detail_area_id": lrgCd,
            "hotelList": [...content]
        });
        
        let data = JSON.stringify(allHotels);
        fs.writeFileSync('./result_jalan/result_rank_adult2.json', data);
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

