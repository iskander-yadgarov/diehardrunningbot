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
const strings_1 = __importDefault(require("../../resources/strings"));
const scenes_1 = require("../scenes");
const bookings_model_1 = require("../../models/bookings/bookings.model");
const events_model_1 = require("../../models/events/events.model");
var KeyboardAction;
(function (KeyboardAction) {
    KeyboardAction["openTraining"] = "open_training-";
    KeyboardAction["back"] = "back_action";
})(KeyboardAction || (KeyboardAction = {}));
const trainingScene = new telegraf_1.BaseScene(scenes_1.Scene.userTrainings);
const backKeyboard = [telegraf_1.Markup.callbackButton(strings_1.default.general.back, KeyboardAction.back)];
trainingScene.enter((ctx) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('trainingScene enter');
    if (!ctx.chat)
        return; // todo handle error
    let userId = ctx.chat.id.toString();
    bookings_model_1.BookingModel.find({ 'userId': userId }).exec((error, bookings) => __awaiter(void 0, void 0, void 0, function* () {
        if (error)
            return; // todo handle error
        // handle if no bookings for this user
        if (bookings.length == 0) {
            ctx.editMessageText('У вас пока нет записей на тренировки :(', telegraf_1.Markup.inlineKeyboard([backKeyboard]).extra());
            return;
        }
        let ids = [];
        bookings.forEach(booking => {
            if (booking.eventId) {
                ids.push(booking.eventId);
            }
        });
        events_model_1.EventModel.find({ '_id': { $in: ids }, 'date': { $gte: new Date().addHours(-1) } }).sort('date').exec((error, events) => __awaiter(void 0, void 0, void 0, function* () {
            if (error) {
                console.log(error);
                return;
            } // handle error
            let trainingsBtns = [];
            events.forEach(event => {
                let localizedDate = `${event.date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} ${event.date.getStringFullDate()}`;
                let btn = [telegraf_1.Markup.callbackButton(localizedDate, KeyboardAction.openTraining + event._id)];
                trainingsBtns.push(btn);
            });
            trainingsBtns.push(backKeyboard);
            ctx.editMessageText('Тренировки на которые ты записан:', telegraf_1.Markup.inlineKeyboard(trainingsBtns).extra());
        }));
    }));
}));
trainingScene.action(new RegExp(`^${KeyboardAction.openTraining}`), (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    let data = (_a = ctx.callbackQuery) === null || _a === void 0 ? void 0 : _a.data;
    let id = data === null || data === void 0 ? void 0 : data.split('-')[1];
    events_model_1.EventModel.findById(id).exec((error, event) => __awaiter(void 0, void 0, void 0, function* () {
        if (error || !event)
            return; // todo handle errors
        scenes_1.SceneManager.enter(ctx, scenes_1.Scene.trainingPage, event._doc);
    }));
}));
trainingScene.action(KeyboardAction.back, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    scenes_1.SceneManager.back(ctx);
}));
exports.default = trainingScene;
//# sourceMappingURL=index.js.map