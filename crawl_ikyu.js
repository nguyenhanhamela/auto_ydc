require("chromedriver");

const moment = require("moment");

let swd = require("selenium-webdriver");
let browser = new swd.Builder();
let driver = browser.forBrowser("chrome").build();

let { facality_id, operator_id, pass_ikyu } = require("./user.json");

// Step 1 - Opening web page
let driverToOpen = driver.get(
	"https://www.ikyu.com/accommodation/ap/AsfW10101.aspx?AccommodationId=00000440"
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
	var searchStartDate = prevMonthDates[0];
	var searchEndDate = prevMonthDates[prevMonthDates.length - 1];

	// Get date format: from 2022年05月 to 2022年05月
	var rankStartDate = prevMonthDates[0].slice(0, 7).replace(/\//g, '年').concat('月');
	var rankEndDate = prevMonthDates[prevMonthDates.length - 1].slice(0, 7).replace(/\//g, '年').concat('月');
	var dateRank = prevMonthDates[0].slice(0, 7).replace(/\//g, '');
	const lstDate = [];
	lstDate.push(searchStartDate, searchEndDate, rankStartDate, rankEndDate, dateRank)
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
					"//input[@id='ctl00_ContentPlaceHolderMain_TriesteTextAccommodationID']"
				)
			)
			.sendKeys(facality_id);
		return facilityID;
	})
	.then(async () => {
		let operatorID = driver
			.findElement(
				swd.By.xpath(
					"//input[@id='ctl00_ContentPlaceHolderMain_TriesteTextOperatorID']"
				)
			)
			.sendKeys(operator_id);
		return operatorID;
	})
	.then(async () => {
		let password = driver
			.findElement(
				swd.By.xpath(
					"//input[@id='ctl00_ContentPlaceHolderMain_TriesteTextPassword']"
				)
			)
			.sendKeys(pass_ikyu);
		return password;
	})
	.then(async () => {
		let btnSignIn = driver
			.findElement(
				swd.By.xpath(
					"//input[@name='ctl00$ContentPlaceHolderMain$TriesteButtonLogin']"
				)
			)
			.click();
		return btnSignIn;
	})
	.then(async () => {
		driver.get(
			"https://www.ikyu.com/accommodation/ap/rsrv/AsfW60101.aspx?AccommodationId=00000440&AsfMenuId=ASF_14"
		);
	})
	.then(async () => {
		var getDate = handleDateMonth();
		// console.log(getDate);
		await driver.findElement(swd.By.xpath("//input[@id='ctl00_ContentPlaceHolderMain_TriesteRadioDaySelect_2']")).click();
		await driver.findElement(swd.By.xpath("//input[@name='ctl00$ContentPlaceHolderMain$TriesteTextDayFrom']"))
			.clear();
		await driver.findElement(swd.By.xpath("//input[@name='ctl00$ContentPlaceHolderMain$TriesteTextDayFrom']"))
			.sendKeys(getDate[0])

		await driver.findElement(swd.By.xpath("//input[@name='ctl00$ContentPlaceHolderMain$TriesteTextDayTo']"))
			.clear();
		await driver.findElement(swd.By.xpath("//input[@name='ctl00$ContentPlaceHolderMain$TriesteTextDayTo']"))
			.sendKeys(getDate[1])
	})
	.then(async () => {
		let calcellationText = driver.findElement(swd.By.xpath("//label[@for='ctl00_ContentPlaceHolderMain_TriesteCheckStatus']"));
		driver.sleep(30)
		let scroll = await driver.executeScript("arguments[0].scrollIntoView();", calcellationText);
		return scroll;
	})
	.then(async () => {
		await driver.findElement(swd.By.xpath("//input[@id='ctl00_ContentPlaceHolderMain_TriesteCheckStatus']")).click();
		driver.sleep(10)
		await driver.findElement(swd.By.xpath("//input[@id='ctl00_ContentPlaceHolderMain_TriesteButtonSearch']")).click();
		driver.sleep(30)
	})
	.then(async () => {
		/* ikyu data
		{
			"date": "202205",
			"excluding_cancellation_revenue": "14613091",
			"prefecture_sale_rank": "8/150",
			"region_sale_rank": "2/52"
		}*/
		driver.sleep(10);
		var ikyu_data = {}
		let cancellation_revenue = await driver.findElement(swd.By.xpath("//span[@id='ctl00_ContentPlaceHolderMain_TriesteLabelBookingAmount']")).getText();
		let revenue = cancellation_revenue.replace(/,/g, "").replace(/\\/g, '')
		ikyu_data["excluding_cancellation_revenue"] = revenue
		console.log(ikyu_data);
		return ikyu_data;
	})
	.then(async (ikyu_data) => {
		var getDate = handleDateMonth();
		driver.get('https://www.ikyu.com/accommodation/ap/rsrv/AsfW70301.aspx?AccommodationId=00000440&AsfMenuId=ASF_24');
		await driver.findElement(swd.By.id('ctl00_ContentPlaceHolderMain_TargetYMFrom')).sendKeys(getDate[2]);
		await driver.findElement(swd.By.id('ctl00_ContentPlaceHolderMain_TargetYMTo')).sendKeys(getDate[3]);
		await driver.findElement(swd.By.id('ctl00_ContentPlaceHolderMain_TriesteButtonSearch')).click();
		await driver.sleep(15)
		ikyu_data["date"] = getDate[4];
		return ikyu_data;
	})
	.then(async (ikyu_data) => {
		let lstRows = await driver.findElements(
			swd.By.xpath("//div[@id='ctl00_ContentPlaceHolderMain_panelSalesResultRankingList']//table//tr")
		);
		var dataCol = [];
		let lstCols = await driver.findElements(swd.By.xpath("//div[@id='ctl00_ContentPlaceHolderMain_panelSalesResultRankingList']//table/tbody/tr[3]/td"));
		dataCol = [];
		for (col of lstCols) {
			let val = await col.getText();
			dataCol.push(val);
		}
		console.log(dataCol);
		ikyu_data["prefecture_sale_rank"] = String(dataCol[3])
		ikyu_data["region_sale_rank"] = String(dataCol[4])
		console.log(ikyu_data);
	})
	.then(async () => {
		driver.quit();
	})
	.catch(function (err) {
		console.log("Error ", err, "Have some error");
	});
