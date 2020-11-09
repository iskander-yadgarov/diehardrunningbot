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
const user_1 = require("../../managers/user");
const markdown = telegraf_1.Extra.markdown();
var KeyboardAction;
(function (KeyboardAction) {
    // book, back, list
    KeyboardAction["bookTraining"] = "book_training";
    KeyboardAction["cancelTraining"] = "cancel_training";
    KeyboardAction["backAction"] = "back_action";
    KeyboardAction["showAll"] = "show_users";
    // payment_cancel = 'payment_cancel',
    // admin: edit
    KeyboardAction["editTraining"] = "edit_training";
})(KeyboardAction || (KeyboardAction = {}));
/*
const invoice: NewInvoiceParameters = {
    provider_token: '401643678:TEST:7426ec98-bf19-4a9d-84bd-94af19084cb7',
    start_parameter: 'workout-coupon',
    title: 'Запись на тренировку',
    description: 'Только оплатив тренировку вы бронируете за собой место ☝️😌',//  Бронь отменить нельзя, но если на тренировку не набереться Х человек, то тренер имеет право ее отменить. В этом случае вы получите купон на бесплатную тренировку.
    currency: 'rub',
    prices: [
        { label: '1 Тренировка', amount: 80000 }
    ],
    payload: 'DieHardCore'
}
*/
const trainingPageScene = new telegraf_1.BaseScene(scenes_1.Scene.trainingPage);
const backButton = telegraf_1.Markup.callbackButton(strings_1.default.general.back, KeyboardAction.backAction);
const bookButton = telegraf_1.Markup.callbackButton(strings_1.default.training_page.buttons.book_training, KeyboardAction.bookTraining);
const cancelButton = telegraf_1.Markup.callbackButton(strings_1.default.training_page.buttons.cancel_training, KeyboardAction.cancelTraining);
const listButton = telegraf_1.Markup.callbackButton(strings_1.default.training_page.buttons.list_training, KeyboardAction.showAll);
const editButton = telegraf_1.Markup.callbackButton(strings_1.default.training_page.buttons.change_training, KeyboardAction.editTraining);
// let initialText: string
// let keyboardExtra: ExtraReplyMessage
trainingPageScene.enter((ctx) => __awaiter(void 0, void 0, void 0, function* () {
    if (ctx.chat == undefined)
        return;
    const userId = ctx.chat.id.toString();
    let event = ctx.session.selectedEvent;
    const alreadyPassed = new Date() > event.date;
    const capacity = event.capacity;
    const initPrice = event.price;
    // const discount = (await UserModel.findOne({'chatId': userId}).exec())?.discount.valueOf() || 0
    // const userPrice = (1 - discount) * event.price
    // check if already booked and count all participents
    bookings_model_1.BookingModel.find({ eventId: event._id }).exec((error, bookings) => __awaiter(void 0, void 0, void 0, function* () {
        if (error)
            return; // todo handle error
        let alreadyBooked = false;
        for (let b of bookings) {
            if (b.userId == userId) {
                alreadyBooked = true;
                break;
            }
        }
        ;
        let initialText = `*Информация о тренировке:*\n
Тренировка: ${event.name}
Дата: ${event.date.getStringDate()}
Время: ${event.date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
Локация: ${event.address}
Стоимость: ${initPrice} ₽`;
        let keyboards = [];
        const hasSpace = (bookings.length < capacity);
        if (alreadyPassed) {
            initialText += `\n\nЭта тренировка уже в прошлом...`;
            initialText += `\nПрисутствовало: ${bookings.length} человек`;
        }
        else if (alreadyBooked || hasSpace) {
            initialText += `\n\nЗаписалось: ${bookings.length}/${capacity}`;
            keyboards.push([alreadyBooked ? cancelButton : bookButton]);
        }
        else {
            initialText += `\n\nНет свободных мест 😭`;
        }
        keyboards.push([listButton]);
        if (user_1.UserManager.isAdmin(userId) && !alreadyPassed) {
            keyboards.push([editButton]);
        }
        keyboards.push([backButton]);
        const extra = telegraf_1.Markup.inlineKeyboard(keyboards).extra();
        extra.parse_mode = 'Markdown';
        ctx.editMessageText(initialText, extra);
        ctx.answerCbQuery();
    }));
}));
trainingPageScene.action(KeyboardAction.backAction, (ctx) => {
    ctx.scene.enter(scenes_1.Scene.schedule);
});
trainingPageScene.action(KeyboardAction.bookTraining, (ctx) => {
    if (ctx.chat == undefined)
        return;
    let userId = ctx.chat.id.toString();
    let event = ctx.session.selectedEvent;
    let eventId = event._id;
    // check if we already have this booking
    bookings_model_1.BookingModel.find({ 'eventId': eventId }).exec((error, bookings) => __awaiter(void 0, void 0, void 0, function* () {
        if (error)
            return; // todo handle error
        if (bookings.find(b => b.userId == userId)) {
            ctx.reply(`Вы уже записались на эту тренировку 😊`);
        }
        else if (bookings.length >= event.capacity) {
            // no space
            ctx.reply(`Извини, но мест уже нет 😭`);
        }
        else {
            // const discount = (await UserModel.findOne({'chatId': userId}).exec())?.discount?.valueOf() || 0
            // const userPrice = Math.ceil((1 - discount) * event.price)
            // if (userPrice > 80) { // TODO check for minimal price for invoice (76,83 RUB)
            //     let paymentButtons = Markup.inlineKeyboard([
            //         [Markup.payButton(`Оплатить ${userPrice} RUB`),
            //         Markup.callbackButton('Отменить', KeyboardAction.payment_cancel)]
            //     ]).extra() as ExtraInvoice // 🤬🤬🤬🤬🤬 потратил час на этот каст
            //     invoice.prices[0].amount = userPrice * 100
            //     ctx.replyWithInvoice(invoice, paymentButtons)
            // }
            // create new Booking
            const booking = {
                userId: userId,
                eventId: eventId,
                status: 1
            };
            // do we need 'await' here?
            bookings_model_1.BookingModel.create(booking).then(_ => {
                // ctx.reply(`Ждем тебя на тренировке. 😉`)
                ctx.scene.reenter();
            });
        }
    }));
});
trainingPageScene.action(KeyboardAction.cancelTraining, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    if (ctx.chat == undefined)
        return;
    let userId = ctx.chat.id.toString();
    let eventId = ctx.session.selectedEvent._id;
    const _ = yield bookings_model_1.BookingModel.deleteOne({ 'eventId': eventId, 'userId': userId }).exec();
    ctx.scene.reenter();
}));
trainingPageScene.action(KeyboardAction.showAll, (ctx) => {
    ctx.scene.enter(scenes_1.Scene.userListPage);
});
// PAYMENTS
/*
trainingPageScene.on('pre_checkout_query', (ctx) => {
    let data = ctx.update.pre_checkout_query
    console.log('pre_checkout_query')
    console.log(data)
    console.log('\n\n')
    ctx.answerPreCheckoutQuery(true)
        .then(() => {
            ctx.reply('Thanks for the purchase!')
        })
})

// trainingPageScene.on('pre_checkout_query', ({ answerPreCheckoutQuery }) => answerPreCheckoutQuery(true))

trainingPageScene.on('successful_payment', (ctx: SceneContextMessageUpdate) => {
    console.log('successful_payment')
    console.log(ctx.update.message?.successful_payment)
    console.log('\n\n')
})


trainingPageScene.action(KeyboardAction.payment_cancel, (ctx: SceneContextMessageUpdate) => {
    ctx.deleteMessage()
})
*/
// admin actions
trainingPageScene.action(KeyboardAction.editTraining, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    ctx.scene.enter(scenes_1.Scene.trainingEdit);
}));
function generateKeyboardBasedOn(showToBook, admin) {
    let keyboard = showToBook ? [[backButton, bookButton]] : [[backButton]];
    keyboard.push([listButton]);
    if (admin) {
        keyboard.push([editButton]);
    }
    return telegraf_1.Markup.inlineKeyboard(keyboard);
}
exports.default = trainingPageScene;
//# sourceMappingURL=page.js.map