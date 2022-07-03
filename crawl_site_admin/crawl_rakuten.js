require("chromedriver");

let swd = require("selenium-webdriver");
let browser = new swd.Builder();
let tab = browser.forBrowser("chrome").build();

let { ID, password } = require("../user.json");

// Step 1 - Opening web page
let tabToOpen = tab.get("https://manage.travel.rakuten.co.jp/");
tabToOpen
	.then(function () {
		let findTimeOutP = tab.manage().setTimeouts({
			implicit: 10000, // 10 seconds
		});
		return findTimeOutP;
	})
	.then(function () {
		let promiseUsernameBox = tab.findElement(
			swd.By.xpath("//input[@name='f_id']")
		);
		return promiseUsernameBox;
	})
	.then(function (usernameBox) {
		let promiseFillUsername = usernameBox.sendKeys(ID);
		return promiseFillUsername;
	})
	.then(function () {
		let promisePasswordBox = tab.findElement(
			swd.By.xpath("//input[@name='f_pass']")
		);
		return promisePasswordBox;
	})
	.then(function (passwordBox) {
		let promiseFillPassword = passwordBox.sendKeys(password);
		return promiseFillPassword;
	})
	.then(function () {
		let promiseSignInBtn = tab.findElement(
			swd.By.xpath("//input[@value='ログイン']")
		);
		return promiseSignInBtn;
	})
	.then(function (signInBtn) {
		let promiseClickSignIn = signInBtn.click();
		return promiseClickSignIn;
	})
	.then(function () {
		let promiseGetBtn = tab.findElement(
			swd.By.xpath("//input[@value='宿泊施設カルテ']")
		);
		return promiseGetBtn;
	})
	.then(function (promiseGetBtn) {
		let promiseClickData = promiseGetBtn.click();
		return promiseClickData;
	})
	.then(function () {
		var lstWindows = tab.getAllWindowHandles();
		return lstWindows;
	})
	.then(function (lstWindows) {
		// console.log(lstWindows) // print all list of windows
		// var getCurrentWindow = tab.getWindowHandle();
		// for (let i in lstWindows) {
		//     if (i != getCurrentWindow) {
		//         var st = tab.switchTo().window(i)
		//     }
		// }
		var st = tab.switchTo().window(lstWindows[1]);
		return st;
	})
	.then(function (st) {
		// console.log(st)
		var getTab = tab.getCurrentUrl();
		return getTab;
	})
	.then(function (getTab) {
		// console.log(getTab)
		let promiseDisplayBtn = tab.findElement(
			swd.By.xpath("//input[@value='表示']")
		);
		return promiseDisplayBtn;
	})
	.then(function (promiseDisplayBtn) {
		let promiseClickDisplay = promiseDisplayBtn.click();
		tab.sleep(10);
		return promiseClickDisplay;
	})
	.then(async () => {
		// json sample:
		/*
			{
				"colum A:" "row 1, column 1",
				"colum B:" "row 1, column 2",
			}
			*/
		var tempArray = [];
		const table = [];
		for (let k = 1; k < 14; k++) {
			const name = await tab
				.findElement(
					swd.By.xpath('//table[@id="table1"]/thead/tr[3]/td[' + k + "]")
				)
				.getText();
			tempArray.push(name);
		}
		table.push({
			date: tempArray[0].replace(/\//g, ""),
			pv: tempArray[9].replace(/,/g, ""),
			access_amount: tempArray[3].replace(/,/g, ""),
			conversion_rate: tempArray[5],
			avg_pv: tempArray[10].replace(/,/g, ""),
			access_avg_amount: tempArray[4].replace(/,/g, ""),
			avg_conversion_rate: tempArray[6],
			reservation_avg_unit_price:
				String(Math.round(tempArray[1].replace(/,/g, "") / tempArray[2].replace(/,/g, ""))),
			reservation_avg_amount:
				String(Math.round((parseInt(tempArray[4].replace(/,/g, "")) *
					parseInt(tempArray[6].replace(/%/g, ""))) /
					100)),
			reservation_avg_revenue:
				String(Math.round(tempArray[8].replace(/,/g, "") *
					tempArray[4].replace(/,/g, "") *
					(parseInt(tempArray[6].replace(/%/g, "")) / 100)))
		});
		return table;
	})
	.then(async (table) => {
		// Scroll to table 4
		let element = tab.findElement(swd.By.id("table4"));
		tab.executeScript("arguments[0].scrollIntoView(true);", element);

		// Get monthly data
		var daily_monthly_reports = [], reports = []
		let lstRows = await tab.findElements(
			swd.By.xpath('//table[@id="table4"]/thead/tr')
		);
		var dataCol = [];
		// loop rows
		for (let row = 3; row < lstRows.length; row++) {
			let lstCols = await lstRows[row].findElements(swd.By.css("td"));
			dataCol[row] = [];
			for (col of lstCols) {
				let val = await col.getText();
				dataCol[row].push(val);
			}
		}
		dataCol.map((data) => {
			reports.push({
				date: data[0],
				pv: data[6],
				reservation_avg_unit_price: data[5].replace(/,/g, ""),
				reservation_avg_amount: String(Math.round(data[3] * data[4].replace(/%/g, "") / 100)),
				reservation_avg_revenue: String(Math.round(data[5].replace(/,/g, "") * data[3] * data[4].replace(/%/g, "") / 100))
			});
		});
		// console.log(reports);
		table[0].daily_monthly_reports = reports
		return table;
	})
	.then(async (table) => {
		console.dir(table, { depth: null, colors: true })
		tab.quit();
	})

	.catch(function (err) {
		console.log("Error ", err, "Have some error");
	});
