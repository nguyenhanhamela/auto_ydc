const BasePage = require("./BasePage");
const handleDateMonth = require('../utils/handleDateMonth');
const base = new BasePage();
const inputDate = new handleDateMonth();

class IkyuPage extends BasePage {

    constructor() {
        super();
    }

    async tableFilter() {
        const getDate = inputDate.ikyuHandle();
        console.log(getDate[0]);
        try {
            // Select チェックイン日
            await base.findByXpath("//input[@id='ctl00_ContentPlaceHolderMain_TriesteRadioDaySelect_2']").click()

            // Select from date
            await base.findByXpath("//input[@name='ctl00$ContentPlaceHolderMain$TriesteTextDayFrom']").clear()
            await base.findByXpath("//input[@name='ctl00$ContentPlaceHolderMain$TriesteTextDayFrom']")
                .sendKeys(getDate[0])

            // Select to date
            await base.findByXpath("//input[@name='ctl00$ContentPlaceHolderMain$TriesteTextDayTo']")
                .clear()
            await base.findByXpath("//input[@name='ctl00$ContentPlaceHolderMain$TriesteTextDayTo']")
                .sendKeys(getDate[1])
            
            // Scroll to the checkbox: 検索対象から「キャンセル済」の予約を除外する
            const calcellationText = await base.findByXpath("//label[@for='ctl00_ContentPlaceHolderMain_TriesteCheckStatus']");
            // if(calcellationText) {
                await base.execScript("arguments[0].scrollIntoView();", calcellationText);
            // }
            // else {
            //     alert("Not found element");
            // }  

            // Checkbox status: 検索対象から「キャンセル済」の予約を除外する
            await base.findByXpath("//input[@id='ctl00_ContentPlaceHolderMain_TriesteCheckStatus']").click();
            sleep(10)

            await base.findByXpath("//input[@id='ctl00_ContentPlaceHolderMain_TriesteButtonSearch']").click();
            sleep(30)
        }
        catch (e) {
            throw new Error("not found element..." + e);
        }
    }

    async getTableData() {
        sleep(10);
		var ikyu_data = {}
		let cancellation_revenue = await base.findByXpath("//span[@id='ctl00_ContentPlaceHolderMain_TriesteLabelBookingAmount']").getText();
		let revenue = cancellation_revenue.replace(/,/g, "").replace(/\\/g, '')
		ikyu_data["excluding_cancellation_revenue"] = revenue
		console.log(ikyu_data);
		return ikyu_data;
    }
}
module.exports = new IkyuPage();