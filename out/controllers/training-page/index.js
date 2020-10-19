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
const users_model_1 = require("../../models/users/users.model");
const events_model_1 = require("../../models/events/events.model");
const markdown = telegraf_1.Extra.markdown();
var KeyboardAction;
(function (KeyboardAction) {
    // book, back,
    KeyboardAction["bookTraining"] = "book_training-";
    KeyboardAction["backAction"] = "back_action";
    // admin: edit, delete, show all participants
    KeyboardAction["editTraining"] = "edit_training";
    KeyboardAction["deleteTraining"] = "delete_training";
    KeyboardAction["showAll"] = "show_users";
})(KeyboardAction || (KeyboardAction = {}));
const trainingPageScene = new telegraf_1.BaseScene(scenes_1.Scene.trainingPage);
const userKeyboard = telegraf_1.Markup.inlineKeyboard([
    [telegraf_1.Markup.callbackButton(strings_1.default.training_page.buttons.back, KeyboardAction.backAction),
        telegraf_1.Markup.callbackButton(strings_1.default.training_page.buttons.book_training, KeyboardAction.bookTraining)]
]);
const adminKeyboard = [
    [telegraf_1.Markup.callbackButton('Список участников', KeyboardAction.showAll)],
    [telegraf_1.Markup.callbackButton('Изменить', KeyboardAction.editTraining)],
    [telegraf_1.Markup.callbackButton('Удалить', KeyboardAction.deleteTraining)]
];
trainingPageScene.enter((ctx) => __awaiter(void 0, void 0, void 0, function* () {
    // todo check isAdmin()? for different keyboards
    if (ctx.chat == undefined)
        return;
    const userId = ctx.chat.id.toString();
    let event = ctx.scene.state._doc; // not realy cool
    const capacity = event.capacity || 10;
    const price = event.price || 600;
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
        const amount = `${capacity - bookings.length}/${capacity}`;
        let localizedDate = `${event.date.getStringFullDate()}, ${event.date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
        const showToBook = !alreadyBooked && (bookings.length < capacity);
        const extra = generateKeyboardBasedOn(showToBook, (user_1.UserManager.isAdmin(userId))).extra();
        extra.parse_mode = "Markdown";
        yield ctx.editMessageText(`*Информация о тренировке:*\n
Имя: ${event.name}
Дата и время: ${localizedDate}
Адресс: ${event.address}
Свободных мест: ${amount}
Стоимость: ${price} руб`, extra);
    }));
}));
trainingPageScene.action(KeyboardAction.backAction, (ctx) => {
    // ctx.scene.enter(Scene.start)
    // ctx.scene.leave()
    scenes_1.SceneManager.back(ctx);
});
trainingPageScene.action(KeyboardAction.bookTraining, (ctx) => {
    if (ctx.chat == undefined)
        return;
    let userId = ctx.chat.id.toString();
    let event = ctx.scene.state._doc; // not realy cool
    let eventId = event._id;
    // check if we already have this booking
    bookings_model_1.BookingModel.findOne({ 'userId': userId, 'eventId': eventId }).exec((error, booking) => __awaiter(void 0, void 0, void 0, function* () {
        if (error)
            return; // todo handle error
        if (booking) {
            ctx.reply(`Вы уже записались на эту тренировку.`);
        }
        else {
            // create new Booking
            const booking = {
                userId: userId,
                eventId: eventId,
                status: 1
            };
            // do we need 'await' here? 
            bookings_model_1.BookingModel.create(booking).then(_ => {
                ctx.reply(`Ждем тебя на тренировке. 😉`);
                ctx.scene.reenter();
            });
        }
    }));
});
// admin actions
trainingPageScene.action(KeyboardAction.showAll, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    let event = ctx.scene.state._doc; // not realy cool
    let eventId = event._id;
    bookings_model_1.BookingModel.find({ 'eventId': eventId }).exec((error, bookings) => __awaiter(void 0, void 0, void 0, function* () {
        if (error)
            return; // todo handle error
        let ids = [];
        bookings.forEach(booking => {
            if (booking.userId) {
                ids.push(booking.userId);
            }
        });
        users_model_1.UserModel.find({ 'chatId': { $in: ids } }).exec((error, users) => __awaiter(void 0, void 0, void 0, function* () {
            if (error)
                return; // todo handle error
            let listOfUsers = '';
            let index = 0;
            if (users.length > 0) {
                listOfUsers = 'Те кто записаны на тренировку:';
                users.forEach(u => {
                    listOfUsers += `\n${++index}) ${u.firstName} ${u.lastName}`;
                });
            }
            else {
                listOfUsers = 'Пока никто не записался на эту тренировку.';
            }
            ctx.reply(listOfUsers);
        }));
    }));
}));
let hasDeleting = false;
trainingPageScene.action(KeyboardAction.deleteTraining, (ctx) => {
    hasDeleting = true;
    ctx.reply('Вы уверены что хотите удалить эту тренировку? (Да / Нет)', telegraf_1.Markup.keyboard(['Да', 'Нет'], { columns: 2 }).oneTime(true).resize().extra());
});
trainingPageScene.hears('Да', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    if (!hasDeleting)
        return;
    let event = ctx.scene.state._doc; // not realy cool
    let eventId = event._id;
    events_model_1.EventModel.findByIdAndDelete(eventId).exec((error) => __awaiter(void 0, void 0, void 0, function* () {
        bookings_model_1.BookingModel.deleteMany({ 'eventId': eventId }).exec((error) => __awaiter(void 0, void 0, void 0, function* () {
            if (error)
                return; // todo handle error
            ctx.reply('Тренировка успешно удалена.');
            scenes_1.SceneManager.back(ctx);
        }));
    }));
}));
trainingPageScene.hears('Нет', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    hasDeleting = false;
}));
function generateKeyboardBasedOn(showToBook, admin) {
    let keyboard = [[telegraf_1.Markup.callbackButton(strings_1.default.training_page.buttons.back, KeyboardAction.backAction)]];
    if (showToBook) {
        keyboard[0].push(telegraf_1.Markup.callbackButton(strings_1.default.training_page.buttons.book_training, KeyboardAction.bookTraining));
    }
    if (admin) {
        keyboard = keyboard.concat(adminKeyboard);
    }
    return telegraf_1.Markup.inlineKeyboard(keyboard);
}
exports.default = trainingPageScene;
//# sourceMappingURL=index.js.map