require("chromedriver");

const moment = require("moment");

let swd = require("selenium-webdriver");
let browser = new swd.Builder();
let driver = browser.forBrowser("chrome").build();

let { user_jalan, pass_jalan } = require("../user.json");

// Step 1 - Opening web page

const openWebPage = async() => {
	// driver.manage().setTimeouts({implicit: 30000})
	let driverToOpen = driver.get(
		"https://www.jalan.net/"
	);
	driverToOpen
		.then(async () => {
			let findTimeOutP = driver.manage().setTimeouts({
				implicit: 30000, // 30 seconds
			});
			await driver.manage().window().maximize();
			return findTimeOutP;
		})
		.then(async() => {
			let prefectureList = await driver.findElement(swd.By.xpath("//select[@name='kenCd']")).click();
			let precVal = await driver.findElements(swd.By.xpath("//select[@name='kenCd']/option"));
			for (let i = 1; i < 3; i++) {
				await driver.findElement(swd.By.xpath(("//select[@name='kenCd']//option") + "[" + i + "]")).click();
				// let mediumAreaBox = await driver.findElement(swd.By.xpath("//select[@name='lrgCd']")).click();
				// let mediumAreaLst = await driver.findElements(swd.By.xpath("//select[@name='lrgCd']//option"));
				// for (let j = 0; j < mediumAreaLst.length; j++) {
				// 	console.log(j);
				// 	await driver.findElement(swd.By.xpath(("//select[@name='lrgCd']//option") + "[" + j + "]")).click();
				// }
				console.log(i);
			}
			
		})
		.then(async () => {
		    await driver.sleep(30)
			// await driver.quit();
		})
		.catch(function (err) {
			console.log("Error ", err, "Have some error");
		});
};
openWebPage();