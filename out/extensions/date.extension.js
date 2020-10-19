"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {};
Date.prototype.addDays = function (days) {
    if (!days)
        return this;
    let date = this;
    date.setDate(date.getDate() + days);
    return date;
};
Date.prototype.isToday = function () {
    let today = new Date();
    return this.isSameDate(today);
};
Date.prototype.clone = function () {
    return new Date(+this);
};
Date.prototype.isAnotherMonth = function (date) {
    return date && this.getMonth() !== date.getMonth();
};
Date.prototype.isWeekend = function () {
    return this.getDay() === 0 || this.getDay() === 6;
};
Date.prototype.isSameDate = function (date) {
    return date && this.getFullYear() === date.getFullYear() && this.getMonth() === date.getMonth() && this.getDate() === date.getDate();
};
Date.prototype.getStringFullDate = function () {
    return `${this.getStringDate()} ${this.getStringDayMonth()}`;
};
Date.prototype.getStringDayMonth = function () {
    const date = this.getDate();
    const month = this.getMonth();
    const monthStr = month > 9 ? month.toString() : '0' + month.toString();
    return `${date}.${monthStr}`;
};
Date.prototype.getStringDate = function () {
    //Month names in English
    let monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    let today = new Date();
    if (this.getFullYear() === today.getFullYear() && this.getMonth() == today.getMonth() && this.getDate() == today.getDate()) {
        return "Сегодня";
    }
    else if (this.getFullYear() === today.getFullYear() && this.getMonth() == today.getMonth() && this.getDate() == today.getDate() + 1) {
        return "Завтра";
    }
    else {
        return this.getStringDay();
    }
};
Date.prototype.getStringDay = function () {
    // let days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
    let days = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
    return days[this.getDay()];
};
Date.prototype.addHours = function (h) {
    this.setTime(this.getTime() + (h * 60 * 60 * 1000));
    return this;
};
//# sourceMappingURL=date.extension.js.map