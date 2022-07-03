const moment = require("moment");
module.exports = class handleDateMonth {
    ikyuHandle() {
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

    jalanHandle() {
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
}