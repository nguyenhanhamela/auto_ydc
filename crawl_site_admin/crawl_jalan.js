require("chromedriver");

const moment = require("moment");

let swd = require("selenium-webdriver");
let browser = new swd.Builder();
let driver = browser.forBrowser("chrome").build();

let { user_jalan, pass_jalan } = require("../user.json");

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
	var getYear = prevMonthDates[0].slice(0, 4);
	// console.log(getYear);
	var getMonth = prevMonthDates[0].slice(5, 2);
	// console.log(getMonth);
	var getYearMonth = prevMonthDates[0].slice(0,7).replace(/\//g, '');
	// console.log(getYearMonth);
	const lstDate = [];
	lstDate.push(getYear, getMonth, getYearMonth)
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
	.then(async () => {
		let customerTab = await driver.findElement(swd.By.className('management'))
			.click();
		return customerTab;
	})
	.then(async () => {
		let reserveBtn = await driver.findElement(swd.By.xpath("//img[@name='visibleButton01']"))
			.click();
		return reserveBtn;
	})
	.then(async () => {
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
		var getDate = handleDateMonth();
		await driver.switchTo().window(lstWindows[1]);
		
		var jalanTable = {}
		var daily_monthly_reports = [], reports = []
		let lstRows = await driver.findElements(
			swd.By.xpath('//table[@summary="予約状況分析(日別)"]//tbody/tr')
		);
		// loop through rows tfoot
		dataColLastRows = []
		let lstColsLastRow = await driver.findElements(swd.By.xpath('//table[@summary="予約状況分析(日別)"]//tfoot/tr/td'));
		dataColLastRows = [];
		for (col of lstColsLastRow) {
			let value = await col.getText();
			dataColLastRows.push(value);
		}
		jalanTable["date"] = getDate[2]
		jalanTable["pv"] = dataColLastRows[8].replace(/,/g, "");
		// jalanTable["reservation_avg_unit_price"] = dataColLastRows[4].replace(/,/g, "");
		// jalanTable["reservation_avg_amount"] = dataColLastRows[6].replace(/,/g, "");
		// jalanTable["reservation_avg_revenue"] =  dataColLastRows[3].replace(/,/g, "");

		// loop list row tbody
		var dataCol = [];		
		for (let row = 0; row < lstRows.length; row++) {
			let lstCols = await lstRows[row].findElements(swd.By.css("td"));

			dataCol[row] = [];
			for (col of lstCols) {
				let val = await col.getText();
				dataCol[row].push(val);
			}
		}

		dataCol.map((data) => {
			reports.push({
				date: getDate[0] + "/" + data[0].slice(0,8).replace(/月/g, '/').slice(0,9),
				pv: data[8]
				// reservation_avg_unit_price: data[4].replace(/,/g, ""),
				// reservation_avg_amount: data[6].replace(/,/g, ""),
				// reservation_avg_revenue: data[3].replace(/,/g, "")
			});
		});
		jalanTable["daily_monthly_reports"] = reports
		console.dir(jalanTable, { depth: null, colors: true })
	})
	.then(async () => {
		driver.quit();		
	})
	.catch(function (err) {
		console.log("Error ", err, "Have some error");
	});