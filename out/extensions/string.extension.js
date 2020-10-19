"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {};
/**
 *
    Бот поддерживает время в формате:
    6      -> 06:00
    5 3    -> 05:03
    15:30  -> 15:30
    1530   -> 15:30

    Бот поддерживает дату в формате:
    6      -> 6 число текущего месяца
    9 6    -> 9 июня
    8 7 2017 -> 8 июля 2017 года

    * вместо пробелов между числами даты можно использовать точки

    Если вы введете только время, бот запланирует пост на тот день, который у вас выбран.
    Чтобы отложить пост на любой другой день введите время и дату.

    Например, 16 30 6 8 -> 16:30 6 августа
 */
String.prototype.splitByTimeAndDate = function () {
    const elements = this.split(/[\s.]+/);
    if (elements.length == 0) {
        return undefined;
    }
    const timeElements = splitTimeIfNeeded(elements[0]);
    if (timeElements == undefined) {
        return undefined;
    }
    const numbers = timeElements.concat(elements.slice(1)).map(Number);
    if (numbers.length == 0) {
        return undefined;
    }
    const time = getTime(numbers.slice(0, 2));
    const date = getDate(numbers.slice(2));
    if (time == undefined || date == undefined) {
        return undefined;
    }
    else {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate(), time.getHours(), time.getMinutes());
    }
};
function splitTimeIfNeeded(text) {
    if (text.length > 2) {
        switch (text.length) {
            case 3: {
                return undefined;
            }
            case 4: {
                return [text.slice(0, 2), text.slice(2)];
            }
            case 5: {
                if (text.includes(':')) {
                    return text.split(':');
                }
                else {
                    return undefined;
                }
            }
            default: {
                return undefined;
            }
        }
    }
    else {
        return [text];
    }
}
function getTime(numbers) {
    if (numbers.length == 0 || numbers.length > 2) {
        return undefined;
    }
    let date = new Date();
    let hours = numbers[0];
    let minutes = numbers[1];
    if (minutes === undefined) {
        minutes = 0;
    }
    if (hours > 24) {
        return undefined;
    }
    if (minutes > 60) {
        return undefined;
    }
    date.setHours(hours);
    date.setMinutes(minutes);
    return date;
}
function getDate(numbers) {
    let date = new Date();
    if (numbers.length == 0) {
        return date;
    }
    if (numbers.length > 3) {
        return undefined;
    }
    let day = numbers[0];
    let month = numbers[1];
    let year = numbers[2];
    if (month === undefined) {
        month = date.getMonth() + 1;
    }
    if (year === undefined) {
        year = date.getFullYear();
    }
    if (day > 31) {
        return undefined;
    }
    if (month > 12) {
        return undefined;
    }
    date.setFullYear(year, month - 1, day);
    return date;
}
//# sourceMappingURL=string.extension.js.map