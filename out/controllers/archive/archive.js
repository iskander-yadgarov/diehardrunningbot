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
const archiveScene = new telegraf_1.BaseScene(scenes_1.Scene.archiveScene);
const backKeyboard = [telegraf_1.Markup.callbackButton(strings_1.default.general.back, KeyboardAction.back, false)];
archiveScene.enter((ctx) => {
    events_model_1.EventModel.find({ 'date': { $lt: new Date() } }).sort('date').exec((error, events) => __awaiter(void 0, void 0, void 0, function* () {
        if (error) {
            console.log(`error for fetching events in archive: ${error}`);
            return;
        }
        // console.log('passed events:', events)
        let dynamicBtns = [];
        events.forEach(e => {
            const localizedDate = `${e.date.getStringDayMonth()} ${e.date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}`;
            let btn = [telegraf_1.Markup.callbackButton(localizedDate, KeyboardAction.openTraining + e._id, false)];
            dynamicBtns.push(btn);
        });
        if (dynamicBtns.length > 0) {
            dynamicBtns.push(backKeyboard);
            ctx.editMessageText('Тренировки которые уже проведены:', telegraf_1.Markup.inlineKeyboard(dynamicBtns).extra());
        }
        else {
            ctx.editMessageText('Тут будут отображаться проведенные тренировки...', telegraf_1.Markup.inlineKeyboard(backKeyboard).extra());
        }
    }));
});
archiveScene.action(new RegExp(`^${KeyboardAction.openTraining}`), (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    let data = (_a = ctx.callbackQuery) === null || _a === void 0 ? void 0 : _a.data;
    let id = data === null || data === void 0 ? void 0 : data.split('-')[1];
    var promise = events_model_1.EventModel.findOne({ '_id': id }).exec();
    var result = yield promise;
    if (result === undefined)
        return;
    ctx.scene.enter(scenes_1.Scene.trainingPage);
}));
archiveScene.action(KeyboardAction.back, (ctx) => {
    ctx.scene.enter(scenes_1.Scene.schedule);
});
exports.default = archiveScene;
//# sourceMappingURL=archive.js.map