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
const users_model_1 = require("../../models/users/users.model");
var KeyboardAction;
(function (KeyboardAction) {
    KeyboardAction["create_discount"] = "create_discount";
    KeyboardAction["discount_list"] = "discount_list";
    KeyboardAction["create_coupon"] = "create_coupon";
    KeyboardAction["request_contact"] = "request_contact";
    KeyboardAction["discount_confirm"] = "discount_confirm";
    KeyboardAction["discount_cancel"] = "discount_cancel";
    KeyboardAction["back_menu"] = "back_to_menu";
})(KeyboardAction || (KeyboardAction = {}));
var DiscountRequested;
(function (DiscountRequested) {
    DiscountRequested[DiscountRequested["none"] = 0] = "none";
    DiscountRequested[DiscountRequested["user"] = 1] = "user";
    DiscountRequested[DiscountRequested["amount"] = 2] = "amount";
})(DiscountRequested || (DiscountRequested = {}));
const keyboards = telegraf_1.Markup.inlineKeyboard([
    [telegraf_1.Markup.callbackButton('Изменить скидку', KeyboardAction.create_discount)],
    [telegraf_1.Markup.callbackButton('Список всех скидок', KeyboardAction.discount_list)],
    [telegraf_1.Markup.callbackButton('Создать купон', KeyboardAction.create_coupon)],
    [telegraf_1.Markup.callbackButton('Назад', KeyboardAction.back_menu)]
]);
const discountScene = new telegraf_1.BaseScene(scenes_1.Scene.discountSettings);
// let state: DiscountRequested
// let userForDiscount: IUserDocument
// let discountAmount: number
discountScene.enter((ctx) => {
    ctx.editMessageText('Здесь ты можешь привязать скидку к конкретному юзеру.', keyboards.extra());
    ctx.session.state = DiscountRequested.none;
    ctx.session.userForDiscount = undefined;
    ctx.session.discountAmount = undefined;
});
discountScene.action(KeyboardAction.create_discount, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    ctx.session.state = DiscountRequested.user;
    ctx.reply('Отправь мне пользователя к которому хочешь привязать скидку.\n\nЭто можно сделать через опцию "Прикрепить" -> "Контакт"\n(важно: у тебя должен быть номер телефона пользователя ☝️)\n\nЛибо можешь просто отправить имя, я попробую его найти 🤓');
}));
discountScene.on('text', (ctx) => {
    var _a;
    const text = ((_a = ctx.message) === null || _a === void 0 ? void 0 : _a.text) || undefined;
    if (!text)
        return;
    if (ctx.session.state == DiscountRequested.user) {
        const names = text.split(' ');
        console.log(names);
        users_model_1.UserModel.find({ 'firstName': names[0], 'lastName': names[1] }).exec((error, users) => __awaiter(void 0, void 0, void 0, function* () {
            if (error)
                return; // handle
            if (users.length == 0) { // not found
                ctx.reply('Мы не нашли никого по такому имени 😔');
            }
            else if (users.length > 1) { // found more than one
                ctx.reply('Мы нашли больше одного пользователя по такому имени, пожалуйста введи полное имя 🧐');
            }
            else { // exactly one
                let user = ctx.session.userForDiscount = users[0];
                const name = `${user.firstName} ${user.lastName}`;
                if (user.discount > 0) {
                    const currentDiscount = user.discount.valueOf() * 100;
                    ctx.reply(`${name} уже имеет скидку в ${currentDiscount}%. Введи новую скидку от 0 до 100%.`);
                }
                else {
                    ctx.reply(`Введи скидку для ${name}. От 0 до 100%.`);
                }
                ctx.session.state = DiscountRequested.amount;
            }
        }));
    }
    else if (ctx.session.state == DiscountRequested.amount) {
        const amount = Number.parseInt(text);
        if (isNaN(amount) || amount < 0 || amount > 100) {
            // not correct
            ctx.reply(`Скидка должна быть от 0 до 100%`);
        }
        else {
            ctx.session.discountAmount = amount;
            const keyboards = telegraf_1.Markup.inlineKeyboard([
                [telegraf_1.Markup.callbackButton('Ой, затупил 🤦‍♂️', KeyboardAction.discount_cancel),
                    telegraf_1.Markup.callbackButton('Да, все так 👌', KeyboardAction.discount_confirm)]
            ]).extra();
            const name = `${ctx.session.userForDiscount.firstName} ${ctx.session.userForDiscount.lastName}`;
            ctx.reply(`Так, давай все проверим. Ты хочешь выдать скидку для ${name} в размере ${amount}%?`, keyboards);
        }
    }
});
discountScene.on('contact', (ctx) => {
    var _a, _b;
    if (ctx.session.state != DiscountRequested.user)
        return;
    const userId = (_b = (_a = ctx.message) === null || _a === void 0 ? void 0 : _a.contact) === null || _b === void 0 ? void 0 : _b.user_id;
    console.log(ctx.message);
    if (userId == undefined)
        return;
    users_model_1.UserModel.findOne({ 'chatId': userId.toString() }).exec((error, user) => __awaiter(void 0, void 0, void 0, function* () {
        if (error) {
            console.log('error with UserModel.findOne: ' + userId);
        } // handle
        if (user) {
            ctx.session.userForDiscount = user;
            ctx.reply(`Введи скидку для ${user.firstName} ${user.lastName}. От 0 до 100%.`);
            ctx.session.state = DiscountRequested.amount;
        }
        else {
            ctx.reply('Этого пользователя нет в нашей базе 😒');
        }
    }));
});
discountScene.action(KeyboardAction.discount_confirm, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    ctx.session.state = DiscountRequested.none;
    ctx.session.userForDiscount.discount = ctx.session.discountAmount / 100;
    const user = ctx.session.userForDiscount;
    user.updateOne(user).exec((error, user) => __awaiter(void 0, void 0, void 0, function* () {
        if (error)
            return; // todo handle error
        ctx.reply('Скидка успешно сохранена 😉');
    }));
}));
discountScene.action(KeyboardAction.discount_cancel, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    ctx.session.state = DiscountRequested.none;
    ctx.reply('Фух, я то уже думал 😬');
}));
discountScene.action(KeyboardAction.discount_list, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    users_model_1.UserModel.find({}).exec((error, users) => __awaiter(void 0, void 0, void 0, function* () {
        if (error)
            return;
        let list = '';
        let i = 0;
        users.forEach(u => {
            if (u.discount > 0)
                list += `${++i}. ${u.firstName} ${u.lastName} –– ${u.discount.valueOf() * 100}%\n`;
        });
        ctx.reply(list);
    }));
}));
discountScene.action(KeyboardAction.create_coupon, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
}));
discountScene.action(KeyboardAction.back_menu, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    scenes_1.SceneManager.back(ctx);
}));
exports.default = discountScene;
//# sourceMappingURL=discount.js.map