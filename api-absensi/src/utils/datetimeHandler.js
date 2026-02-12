const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");

dayjs.extend(utc);
dayjs.extend(timezone);

const APP_TZ = "Asia/Jayapura";

module.exports = {
    toUTC(date) {
        return dayjs.tz(date, APP_TZ).utc().toDate();
    },

    toLocal(date) {
        return dayjs.utc(date).tz(APP_TZ).toDate();
    },

    getTodayRangeUTC() {
        const start = dayjs().tz(APP_TZ).startOf("day").utc().toDate();
        const end = dayjs().tz(APP_TZ).endOf("day").utc().toDate();
        return { start, end };
    },
};
