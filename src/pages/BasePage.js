require("chromedriver");

let swd = require("selenium-webdriver");
let browser = new swd.Builder();
let driver = browser.forBrowser("chrome").build();
// const { By } = swd.By;

module.exports = class BasePage {

    constructor(driver) {
        return driver;
    }

    // Actions
    async open(path) {
        try {
            await driver.get(path);
            await driver.manage().window().maximize();
        }
        catch (e) {
            throw new Error("can not open the web page ... " + e);
        }
    }

    // Event
    findById(locator) {
        return driver.findElement(swd.By.id(locator));
    }

    findByClass(locator) {
        return driver.findElement(swd.By.class(locator))
    }

    findByXpath(locator) {
        return driver.findElement(swd.By.xpath(locator));
    }

    findElements(locator) {
        return driver.findElements(swd.By.xpath(locator))
    }

    inputValue(locator, val) {
        return this.findById(locator).sendKeys(val);
    }

    execScript(scrollAction){
        // const scrollAction = "arguments[0].scrollIntoView();";
        return driver.executeScript(scrollAction);
    }

    async closePage(){
        driver.quit();
    }


}