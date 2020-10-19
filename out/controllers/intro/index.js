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
const users_model_1 = require("../../models/users/users.model");
var KeyboardAction;
(function (KeyboardAction) {
    KeyboardAction["accept"] = "accept_action";
    KeyboardAction["name_confirm"] = "name_confirm";
    KeyboardAction["menu"] = "go_to_menu";
})(KeyboardAction || (KeyboardAction = {}));
const introScene = new telegraf_1.BaseScene(scenes_1.Scene.intro);
const confirmNameKeyboard = telegraf_1.Markup.inlineKeyboard([telegraf_1.Markup.callbackButton('Все верно 👌', KeyboardAction.name_confirm)]).extra();
// let userName = ''
// let waitingForName: boolean
// let userModel: IUserDocument
// let lastMessageId: number
// let lastMessageText: string
introScene.enter((ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const chatId = (_a = ctx.chat) === null || _a === void 0 ? void 0 : _a.id.toString();
    if (!chatId)
        return;
    ctx.session.userName = '';
    ctx.session.waitingForName = false;
    ctx.session.userModel = undefined;
    ctx.session.lastMessageId = undefined;
    ctx.session.lastMessageText = undefined;
    // properly should be moved to Model class, but I don't know how to do it here 🤦‍♂️
    users_model_1.UserModel.find({ chatId: chatId }).exec((error, users) => __awaiter(void 0, void 0, void 0, function* () {
        if (error) {
            console.log(`error for fetching user ${chatId}: ${error}`);
            return;
        }
        if (users.length > 1) {
            console.log('multiple users with the same id');
        }
        const user = users[0];
        if (user != undefined) {
            // open menu scene
            scenes_1.SceneManager.open(ctx, scenes_1.Scene.menu, { user: user });
        }
        else {
            // show intro messages and wait for reply
            ctx.reply(strings_1.default.intro_scene.message, telegraf_1.Markup.inlineKeyboard([
                [telegraf_1.Markup.callbackButton(strings_1.default.intro_scene.buttons.accept_action, KeyboardAction.accept)]
            ]).extra());
        }
    }));
}));
introScene.action(KeyboardAction.accept, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c, _d;
    const chatId = (_b = ctx.chat) === null || _b === void 0 ? void 0 : _b.id.toString();
    if (!chatId) {
        return;
    }
    // todo check if we have first and last names from default
    ctx.session.waitingForName = true;
    ctx.session.userName = (((_c = ctx.from) === null || _c === void 0 ? void 0 : _c.first_name) || '') + ' ' + (((_d = ctx.from) === null || _d === void 0 ? void 0 : _d.last_name) || '');
    ctx.session.lastMessageText = `Давай познакомимся.\n\nТвое имя ${ctx.session.userName}, все верно?\n\nЕсли нет, то напиши как ты хочешь чтобы к тебе обращались.`;
    ctx.session.lastMessageId = (yield ctx.reply(ctx.session.lastMessageText, confirmNameKeyboard)).message_id;
}));
introScene.on('text', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _e;
    if (!ctx.session.waitingForName)
        return;
    const text = ((_e = ctx.message) === null || _e === void 0 ? void 0 : _e.text) || '';
    const names = text.split(' ');
    if (names.length != 2) {
        ctx.reply('Не чуди, напиши пожалуйста только свое имя и фамилию через пробел.');
    }
    else {
        ctx.telegram.editMessageText(ctx.chat.id, ctx.session.lastMessageId, undefined, ctx.session.lastMessageText);
        ctx.session.userName = text;
        ctx.reply(`${names[0]} ${names[1]}, все верно?`, confirmNameKeyboard);
    }
}));
introScene.action(KeyboardAction.name_confirm, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _f;
    const chatId = (_f = ctx.chat) === null || _f === void 0 ? void 0 : _f.id.toString();
    if (!chatId) {
        return;
    }
    ctx.session.waitingForName = false;
    let names = ctx.session.userName.split(' ');
    const user = {
        chatId: chatId,
        firstName: names[0] || '',
        lastName: names[1] || '',
        discount: 0
    };
    users_model_1.UserModel.create(user).then(newUser => {
        ctx.session.userModel = newUser;
        ctx.reply(`Отлично, ${user.firstName}, больше никаких вопросов!`, telegraf_1.Markup.inlineKeyboard([telegraf_1.Markup.callbackButton('В меню', KeyboardAction.menu)]).extra());
    });
}));
introScene.action(KeyboardAction.menu, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    scenes_1.SceneManager.open(ctx, scenes_1.Scene.menu, ctx.session.userModel);
}));
exports.default = introScene;
//# sourceMappingURL=index.js.map