"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const telegraf_1 = require("telegraf");
const events_model_1 = require("../../models/events/events.model");
const strings_1 = __importDefault(require("../../resources/strings"));
const scenes_1 = require("../scenes");
var KeyboardAction;
(function (KeyboardAction) {
    KeyboardAction["back"] = "back_action";
    KeyboardAction["openTraining"] = "open_training-";
})(KeyboardAction || (KeyboardAction = {}));
const scheduleScene = new telegraf_1.BaseScene(scenes_1.Scene.schedule);
const backKeyboard = [telegraf_1.Markup.callbackButton(strings_1.default.general.back, KeyboardAction.back, false)];
scheduleScene.enter((ctx) => {
    // await ctx.editMessageText(strings.start_scene.message, keyboard.extra())
    buildSchedule(ctx);
});
// startScene.action(KeyboardAction.showTrainingSchedule, (ctx: SceneContextMessageUpdate) => {
function buildSchedule(ctx) {
    // todo find only for today and after: { 'date': {$gte: start, $lt: until} }
    events_model_1.EventModel.find({ 'date': { $gte: new Date(), $lt: new Date().addDays(7) } }).sort('date').exec((error, events) => __awaiter(this, void 0, void 0, function* () {
        if (error) {
            console.log(`error for fetching events: ${error}`);
            return;
        }
        let dynamicButtons = [];
        let row = [];
        let maxCellPerRow = 5;
        for (let i = 0; i < events.length; i++) {
            let e = events[i];
            // make a button
            let btn = telegraf_1.Markup.callbackButton(e.date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }), KeyboardAction.openTraining + e._id, false);
            row.push(btn);
            // if the last one OR the next event's day is not the same 
            if (i == events.length - 1 || !e.date.isSameDate(events[i + 1].date)) {
                // end a row
                let seperatorTitle = [telegraf_1.Markup.callbackButton('👇 ' + e.date.getStringFullDate() + ' 👇', 'null', false)];
                dynamicButtons.push(seperatorTitle);
                // make layout if greater than maximum
                let cellAmount = row.length;
                if (cellAmount > maxCellPerRow) {
                    let rowAmount = Math.ceil(cellAmount / maxCellPerRow);
                    let perRow = Math.ceil(cellAmount / rowAmount);
                    for (let x = 0; x < rowAmount; x++) {
                        let newRow = row.slice(x * perRow, (x != rowAmount - 1) ? (x * perRow) + perRow : row.length);
                        dynamicButtons.push(newRow);
                    }
                }
                else {
                    dynamicButtons.push(row);
                }
                row = []; // clean a row
            }
        }
        dynamicButtons.push(backKeyboard);
        let extra = telegraf_1.Markup.inlineKeyboard(dynamicButtons).extra();
        extra.parse_mode = "MarkdownV2";
        ctx.editMessageText(`Наше расписание на ближайшие 7 дней:`, extra).catch(() => ctx.reply(`Наше расписание на ближайшие дни:`, extra));
    }));
}
// [0-9]*$
scheduleScene.action(new RegExp(`^${KeyboardAction.openTraining}`), (ctx) => {
    var _a;
    let data = (_a = ctx.callbackQuery) === null || _a === void 0 ? void 0 : _a.data;
    let id = data === null || data === void 0 ? void 0 : data.split('-')[1];
    events_model_1.EventModel.findOne({ '_id': id }).exec((error, event) => __awaiter(void 0, void 0, void 0, function* () {
        if (error || !event || !ctx.chat)
            return; // todo handle errors
        // console.log(event)
        // let chatId = ctx.chat.id.toString()
        // go to scene 'pageTraining'
        scenes_1.SceneManager.enter(ctx, scenes_1.Scene.trainingPage, event._doc);
    }));
});
scheduleScene.action(KeyboardAction.back, (ctx) => {
    scenes_1.SceneManager.back(ctx);
});
/*
EventModel.find({}).sort('date').exec(async (error, events) => {
    if (error) { console.log(`error for fetching events: ${error}`); return }

    console.log(events)
    // show to user
    let dynamicButtons = [];
    let row: CallbackButton[] = [];
    let rowLength = 0;
    let previousDate = null

    for (let i = 0; i < events.length; i++) {
        let e = events[i];
        // let humanReadableDate = `${e.date.toLocaleTimeString()} ${e.date.toLocaleDateString()}`
        // e.date.getStringDay().toString()

        if (previousDate != null && !e.date.isSameDate(previousDate) ) {
            // send already filled row

            let seperatorTitle = [Markup.callbackButton((previousDate as Date).getStringDate().toString(), 'null', false)]
            
            dynamicButtons.push(seperatorTitle)
            dynamicButtons.push(row)
            
            // ctx.reply(`Тренировки на ${(previousDate as Date).getStringDate() }:`, Markup.inlineKeyboard([row]).extra())
            // dynamicButtons = [];
            row = []

        }
 
        previousDate = e.date
        let btn = Markup.callbackButton(e.date.toLocaleTimeString('en-GB', {hour: '2-digit', minute:'2-digit'}), KeyboardAction.bookTraining + i.toString(), false)
        row.push(btn)
        // rowLength++

        // if (rowLength == 3)
        // {
            // dynamicButtons.push(row);
            // row = []
            // rowLength = 0
        // }
    }

    let seperatorTitle = [Markup.callbackButton((previousDate as Date).getStringDate().toString(), 'null', false)]
            
    dynamicButtons.push(seperatorTitle)
    dynamicButtons.push(row)

    ctx.reply(`Вот наше расписание:`, Markup.inlineKeyboard(dynamicButtons).extra())
})
*/
// show calendar
/*
let daysToShow = 7
let dayButtons: Array<CallbackButton[]> = [];
let date = new Date()

for (let i = 0; i < daysToShow; i++) {
    let btn = [Markup.callbackButton(date.getStringDate().toString(), KeyboardAction.showTrainingForDay + i.toString(), false)]
    dayButtons.push(btn)
    date.addDays(1)
}

ctx.editMessageText('Выберите день', Markup.inlineKeyboard(dayButtons).extra())
*/
/*
startScene.action(/^show_training-[0-9]*$/, (ctx: SceneContextMessageUpdate) => {
    
    // check
    if (ctx.callbackQuery == undefined) return

    // get day what we are looking
    let data = ctx.callbackQuery.data!
    let index = parseInt(data.split('-')[1])
    
    let date = new Date()
    date = date.addDays(index)
    
    let start = new Date(date.getFullYear(),date.getMonth(),date.getDate(),1,0,0);
    let end = new Date(date.getFullYear(),date.getMonth(),date.getDate()+1,0,59,59);

    // make query
    let query = { 'date': {$gte: start, $lt: end} };

    // load trainings in day
    EventModel.find(query).exec(async (error, events) => {
        if (error) { console.log(`error for fetching events from ${start} to ${end}: ${error}`); return }
        console.log(events)

        // show to user
        let dynamicButtons = [];
        for (let i = 0; i < events.length; i++) {
            let e = events[i];
            let btn = [Markup.callbackButton(`${e.name} на ${e.address} в ${e.date.toLocaleTimeString()}`, KeyboardAction.bookTraining + i.toString(), false)]
            dynamicButtons.push(btn);
        }
        dynamicButtons.push([Markup.callbackButton(strings.start_scene.buttons.back, KeyboardAction.showTrainingSchedule, false)])

        ctx.editMessageText(`Вот доступные тренировки на ${date.toLocaleDateString()}:`, Markup.inlineKeyboard(dynamicButtons).extra())
    })
    
})
*/
exports.default = scheduleScene;
//# sourceMappingURL=index.js.map