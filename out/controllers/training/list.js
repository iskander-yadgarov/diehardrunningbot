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
Object.defineProperty(exports, "__esModule", { value: true });
const telegraf_1 = require("telegraf");
const scenes_1 = require("../scenes");
const bookings_model_1 = require("../../models/bookings/bookings.model");
const users_model_1 = require("../../models/users/users.model");
var KeyboardAction;
(function (KeyboardAction) {
    KeyboardAction["back"] = "back-action";
})(KeyboardAction || (KeyboardAction = {}));
const userListScene = new telegraf_1.BaseScene(scenes_1.Scene.userListPage);
const keyboard = telegraf_1.Markup.inlineKeyboard([
    telegraf_1.Markup.callbackButton('Назад', KeyboardAction.back)
]).extra();
keyboard.parse_mode = "Markdown";
userListScene.enter((ctx) => __awaiter(void 0, void 0, void 0, function* () {
    let event = ctx.scene.state;
    let eventId = event._id;
    bookings_model_1.BookingModel.find({ 'eventId': eventId }).exec((error, bookings) => {
        if (error)
            return; // todo handle error
        let ids = [];
        bookings.forEach(booking => {
            if (booking.userId) {
                ids.push(booking.userId);
            }
        });
        users_model_1.UserModel.find({ 'chatId': { $in: ids } }).exec((error, users) => {
            if (error)
                return; // todo handle error
            let listOfUsers = '';
            let index = 0;
            if (users.length > 0) {
                listOfUsers = '*Участники:*';
                users.forEach(u => {
                    listOfUsers += `\n${++index}. ${u.firstName} ${u.lastName}`;
                });
            }
            else {
                listOfUsers = 'Пока никто не записался.';
            }
            ctx.editMessageText(listOfUsers, keyboard);
        });
    });
}));
userListScene.action(KeyboardAction.back, (ctx) => {
    scenes_1.SceneManager.back(ctx, ctx.scene.state);
});
exports.default = userListScene;
//# sourceMappingURL=list.js.map