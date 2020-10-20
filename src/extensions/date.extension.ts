export default {}

declare global {
    interface Date {
        addDays(days: number, useThis?: boolean): Date;
        isToday(): boolean;
        clone(): Date;
        isAnotherMonth(date: Date): boolean;
        isWeekend(): boolean;
        isSameDate(date: Date): boolean;
        getStringFullDate(): string;
        getStringDate(): string;
        getStringDay(): string;
        getStringDayMonth(): string;
        addHours(h: number): Date;
    }
}

Date.prototype.addDays = function (days: number): Date {
   if (!days) return this;
   let date = this;
   date.setDate(date.getDate() + days);

   return date;
};

Date.prototype.isToday = function (): boolean{
   let today = new Date();
   return this.isSameDate(today);
};

Date.prototype.clone = function (): Date{
   return new Date(+this);
};

Date.prototype.isAnotherMonth = function (date: Date): boolean {
   return date && this.getMonth() !== date.getMonth();
};

Date.prototype.isWeekend = function (): boolean  {
   return this.getDay() === 0 || this.getDay() === 6;
};

Date.prototype.isSameDate = function (date: Date): boolean  {
   return date && this.getFullYear() === date.getFullYear() && this.getMonth() === date.getMonth() && this.getDate() === date.getDate();
};

Date.prototype.getStringFullDate = function (): string {
    return `${this.getStringDate()} ${this.getStringDayMonth()}`;
}

Date.prototype.getStringDayMonth = function(): string {
    const date: number = this.getDate()
    const month: number = (this.getMonth() + 1)
    const monthStr = month > 9 ? month.toString() : '0' + month.toString()
    return `${date}.${monthStr}`
}

Date.prototype.getStringDate = function (): string {
    //Month names in English
    let monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    let today = new Date();
    if (this.getFullYear() === today.getFullYear() && this.getMonth() == today.getMonth() && this.getDate() == today.getDate()) {
        return "Сегодня";
    } else if (this.getFullYear() === today.getFullYear() && this.getMonth() == today.getMonth() && this.getDate() == today.getDate() + 1) {
        return "Завтра";
    } else {
        return this.getStringDay();
    }
}

Date.prototype.getStringDay = function (): string {
    // let days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
    let days = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
    return days[this.getDay()]
}

Date.prototype.addHours = function(h) {
    this.setTime(this.getTime() + (h*60*60*1000));
    return this;
}