require("chromedriver");

const moment = require("moment");

let swd = require("selenium-webdriver");
let Chrome = require("selenium-webdriver/chrome");
let browser = new swd.Builder();
// let driver = browser.forBrowser("chrome").build();


let { facality_id, operator_id, pass_ikyu } = require("./user.json");

// Step 1 - Opening web page
function loadSelenium() {
  let options = new Chrome.Options();
  let capabilities = options.toCapabilities();
  console.log('loading another');
  return new webdriver.Builder()
    .forBrowser('chrome')
    .withCapabilities(capabilities)
    .build();
}

// for(let i = 0; i < 5; i++) {
//     let driver = loadSelenium();
//     driver.get('http://www.google.com');
// }
// let count = 0;
// for (let i= 1; i< 50000; i++) {
//     let driverToOpen = driver.get(
//         "https://package.travel.rakuten.co.jp/anafrt/planList/hotelPlanList?noTomariHotel=" + i + "&idTomariPlan=5180197&l-id=package_ANA_saleprice_1&fDptab=1&dHatuToujyouYy=2022&dHatuToujyouMm=10&dHatuToujyouDd=3&dTyakuToujyouYy=2022&dTyakuToujyouMm=10&dTyakuToujyouDd=4&dCheckInYy=2022&dCheckInMm=10&dCheckInDd=3&dCheckOutYy=2022&dCheckOutMm=10&dCheckOutDd=4&cdHatuKuukou=HND&cdTyakuKuukou=OKA&cdHatuKuukouHukuro=OKA&cdTyakuKuukouHukuro=HND&suOtona=2#5180197"
//         // "https://travel.rakuten.co.jp/yado/ishikawa/nanao.html?lid=jparea_undated_map"
//     );
//     count++;
//     console.log("tesst....." + count);    
// }

// var check = true;
// (async () => {
// while(check) {
//     await (async function test() {
//         let driver = await browser.forBrowser("chrome").build();
//         try {
//           await driver.get("https://travel.rakuten.co.jp/yado/ishikawa/nanao.html?lid=jparea_undated_map");
//         } catch(e) {
//           console.log(err);
//         } finally {
//           await driver.quit();
//         }
//       })();
// }
// })();
(async () => {
  for (let i = 0; i < 2; i++) {
    let time = new Date();
    let option = new Chrome.Options().headless();
    let driver = await browser.forBrowser("chrome").setChromeOptions(option).build();
    await (async function test() {
      try {
        await driver.get("https://travel.rakuten.co.jp/yado/ishikawa/nanao.html?lid=jparea_undated_map");
        console.log(" run process " + i + time.toUTCString())
      } catch (e) {
        console.log(err);
      } finally {
        await driver.quit();
      }
    })();
  }
})();