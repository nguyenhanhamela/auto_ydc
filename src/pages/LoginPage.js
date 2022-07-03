const BasePage = require("./BasePage");
const base = new BasePage();

class LoginPage extends BasePage {
    constructor() {
        super();
    }
    
    async login(param1, param2, param3) {
        await base.findById('ctl00_ContentPlaceHolderMain_TriesteTextAccommodationID').sendKeys(param1);
        await base.findById('ctl00_ContentPlaceHolderMain_TriesteTextOperatorID').sendKeys(param2);
        await base.findByXpath("//input[@id='ctl00_ContentPlaceHolderMain_TriesteTextPassword']").sendKeys(param3)
        await base.findByXpath("//input[@name='ctl00$ContentPlaceHolderMain$TriesteButtonLogin']").click();
    }
}
module.exports = new LoginPage();