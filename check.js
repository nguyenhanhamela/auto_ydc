require("chromedriver");

const moment = require("moment");

let swd = require("selenium-webdriver");
let browser = new swd.Builder();
let driver = browser.forBrowser("chrome").build();


// Step 1 - Opening web page
let driverToOpen = driver.get(
	"https://www.ikyu.com/hakone/160614/"
);