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
    KeyboardAction["ready"] = "ready";
})(KeyboardAction || (KeyboardAction = {}));
const introScene = new telegraf_1.BaseScene(scenes_1.Scene.intro);
const confirmNameKeyboard = telegraf_1.Markup.inlineKeyboard([telegraf_1.Markup.callbackButton('Погнали 💪', KeyboardAction.ready)]).extra();
introScene.enter((ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const firstName = (_a = ctx.from) === null || _a === void 0 ? void 0 : _a.first_name;
    // show intro messages and wait for reply
    ctx.reply(`Привет, ${firstName}!\n\n${strings_1.default.intro_scene.message}`, confirmNameKeyboard);
}));
introScene.action(KeyboardAction.ready, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c, _d;
    const chatId = (_b = ctx.chat) === null || _b === void 0 ? void 0 : _b.id.toString();
    if (!chatId)
        return;
    let promise1 = users_model_1.UserModel.find({ chatId: chatId }).exec();
    // const users = await promise
    let users = yield promise1;
    if (users === undefined) {
        console.log(`error for fetching user ${chatId}`);
    }
    if (users.length > 1) {
        console.log('multiple users with the same id');
        return;
    }
    // console.log(promise)
    // const user = users[0]
    if (users[0] != undefined) {
        ctx.scene.enter(scenes_1.Scene.schedule);
    }
    else {
        const user = {
            chatId: chatId,
            firstName: ((_c = ctx.from) === null || _c === void 0 ? void 0 : _c.first_name) || '',
            lastName: ((_d = ctx.from) === null || _d === void 0 ? void 0 : _d.last_name) || '',
            discount: 0
        };
        const promise = users_model_1.UserModel.create(user).then(newUser => {
            ctx.scene.enter(scenes_1.Scene.schedule);
        });
    }
}));
/*
introScene.action(KeyboardAction.accept, async (ctx: SceneContextMessageUpdate) => {
  const chatId = ctx.chat?.id.toString()
  if (!chatId) { return }

  // todo check if we have first and last names from default
  ctx.state.waitingForName = true
  ctx.state.userName = (ctx.from?.first_name || '') + ' ' + (ctx.from?.last_name || '')
  ctx.state.lastMessageText = `Давай познакомимся.\n\nТвое имя ${ctx.state.userName}, все верно?\n\nЕсли нет, то напиши как ты хочешь чтобы к тебе обращались.`
  ctx.state.lastMessageId = (await ctx.reply(ctx.state.lastMessageText, confirmNameKeyboard)).message_id
})

introScene.on('text', async (ctx: SceneContextMessageUpdate) => {
  if (!ctx.state.waitingForName) return

  const text = ctx.message?.text || ''
  const names = text.split(' ')

  if (names.length != 2) {
    ctx.reply('Не чуди, напиши пожалуйста только свое имя и фамилию через пробел.')
  } else {
    ctx.telegram.editMessageText(ctx.chat!.id, ctx.state.lastMessageId, undefined, ctx.state.lastMessageText)
    ctx.state.userName = text
    ctx.reply(`${names[0]} ${names[1]}, все верно?`, confirmNameKeyboard)
  }
})

introScene.action(KeyboardAction.name_confirm, async (ctx: SceneContextMessageUpdate) => {
  const chatId = ctx.chat?.id.toString()
  if (!chatId) { return }

  ctx.state.waitingForName = false
  let names = ctx.state.userName.split(' ')

  const user = {
    chatId: chatId,
    firstName: names[0] || '',
    lastName: names[1] || '',
    discount: 0
  }

  UserModel.create(user).then(newUser => {
    ctx.state.userModel = newUser
    ctx.reply(`Отлично, ${user.firstName}, больше никаких вопросов!`, Markup.inlineKeyboard(
      [Markup.callbackButton('В меню', KeyboardAction.menu)]
    ).extra())
  })
})
*/
exports.default = introScene;
//# sourceMappingURL=index.js.map