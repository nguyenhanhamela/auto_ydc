// const assert = require('assert')
const LoginPage = require ('../pages/LoginPage')
const BasePage = require('../pages/BasePage')
const handleDateMonth = require('../utils/handleDateMonth')
const IkyuPage = require('../pages/IkyuPage')

const page = new BasePage();
const inputDate = new handleDateMonth();

let { facality_id, operator_id, pass_ikyu } = require("../../user.json");

const runTest = async() => {
    // Open to login
    await page.open("https://www.ikyu.com/accommodation/ap/AsfW10101.aspx");
    await LoginPage.login(facality_id, operator_id, pass_ikyu);
    await page.open("https://www.ikyu.com/accommodation/ap/rsrv/AsfW60101.aspx?AccommodationId=" + facality_id + "&AsfMenuId=ASF_14")
    
    await IkyuPage.tableFilter();
    await IkyuPage.getTableData();

    await page.closePage();

}

runTest();