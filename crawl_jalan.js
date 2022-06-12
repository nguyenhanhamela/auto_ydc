require("chromedriver");

const moment = require("moment");

let swd = require("selenium-webdriver");
let browser = new swd.Builder();
let driver = browser.forBrowser("chrome").build();

let { user_jalan, pass_jalan} = require("./user.json");

// Step 1 - Opening web page
let driverToOpen = driver.get(
	"https://wwws.jalan.net/yw/ywp0100/ywt0100LoginTop.do"
);
const handleDateMonth = function () {
	// Get moment at start date of previous month
	var prevMonth = moment().subtract(1, "month").startOf("month");
	var prevMonthDays = prevMonth.daysInMonth();

	// Array to collect dates of previous month
	var prevMonthDates = [];

	for (var i = 0; i < prevMonthDays; i++) {
		// Calculate moment based on start of previous month, plus day offset
		var prevMonthDay = prevMonth.clone().add(i, "days").format("YYYY/MM/DD");

		prevMonthDates.push(prevMonthDay);
	}
	var getYear = prevMonthDates[0].slice(1,4)
	var getMonth = prevMonthDates[0].slice(5,6)
	const lstDate = [];
	lstDate.push(getYear, getMonth)
	return lstDate;
}
driverToOpen
	.then(async () => {
		let findTimeOutP = driver.manage().setTimeouts({
			implicit: 10000, // 10 seconds
		});
		driver.manage().window().maximize();
		return findTimeOutP;
	})
	.then(async () => {
		let facilityID = driver
			.findElement(
				swd.By.xpath(
					"//input[@name='usrId']"
				)
			)
			.sendKeys(user_jalan);
		return facilityID;
	})
	.then(async () => {
		let password = driver
			.findElement(
				swd.By.xpath(
					"//input[@name='usrPwd']"
				)
			)
			.sendKeys(pass_jalan);
		return password;
	})
	.then(async () => {
		let btnSignIn = driver
			.findElement(
				swd.By.xpath(
					"//input[@class='rollover']"
				)
			)
			.click();
		return btnSignIn;
	})
	.then (async() => {
		let customerTab = await driver.findElement(swd.By.className('management'))
			.click();
		return customerTab;
	})
	.then (async() => {
		let reserveBtn = await driver.findElement(swd.By.xpath("//img[@name='visibleButton01']"))
			.click();
		return reserveBtn;
	})
	.then (async() => {
		var getDate = handleDateMonth();
		driver.sleep(10)
		await driver.findElement(swd.By.xpath("//select[@name='dispThisLastYear2']")).sendKeys(getDate[0]);
		await driver.findElement(swd.By.xpath("//img[@alt='表示する']")).click();
	})
	.then(async () => {
		var lstWindows = await driver.getAllWindowHandles();
		return lstWindows;
	})
	.then(async (lstWindows) => {
		console.log(lstWindows[1])
		await driver.switchTo().window(lstWindows[1]);
		// let getElm = await driver.findElement(swd.By.xpath("//table[@summary='予約状況分析(日別)']//")).getText();
		// console.log(getElm);
		
	})
	.then(async () => {
		// driver.quit();
		console.log("Enddd")
	})
	.catch(function (err) {
		console.log("Error ", err, "Have some error");
	});