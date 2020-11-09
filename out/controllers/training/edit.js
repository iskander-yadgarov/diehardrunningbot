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
var Requested;
(function (Requested) {
    Requested["none"] = "none";
    Requested["name"] = "name";
    Requested["capacity"] = "capacity";
    Requested["price"] = "price";
    Requested["date"] = "date";
    Requested["location"] = "location";
})(Requested || (Requested = {}));
var KeyboardAction;
(function (KeyboardAction) {
    KeyboardAction["editTrainingName"] = "edit_training_name";
    KeyboardAction["editTrainingCapacity"] = "edit_training_capacity";
    KeyboardAction["editTrainingPrice"] = "edit_training_price";
    KeyboardAction["editTrainingDate"] = "edit_training_date";
    KeyboardAction["editTrainingLocation"] = "edit_training_location";
    KeyboardAction["deleteTraining"] = "delete_training";
    KeyboardAction["backAction"] = "back";
    KeyboardAction["confirmDeleting"] = "confirm_delete";
    KeyboardAction["cancelDeleting"] = "cancel_delete";
})(KeyboardAction || (KeyboardAction = {}));
const trainingEditScene = new telegraf_1.BaseScene(scenes_1.Scene.trainingEdit);
const keyboard = telegraf_1.Markup.inlineKeyboard([
    [telegraf_1.Markup.callbackButton('Изменить имя', KeyboardAction.editTrainingName)],
    [telegraf_1.Markup.callbackButton('Изменить время/дату', KeyboardAction.editTrainingDate)],
    [telegraf_1.Markup.callbackButton('Изменить адресс', KeyboardAction.editTrainingLocation)],
    [telegraf_1.Markup.callbackButton('Изменить кол-во мест', KeyboardAction.editTrainingCapacity)],
    [telegraf_1.Markup.callbackButton('Изменить стоимость', KeyboardAction.editTrainingPrice)],
    [telegraf_1.Markup.callbackButton('Удалить', KeyboardAction.deleteTraining)],
    [telegraf_1.Markup.callbackButton(strings_1.default.general.back, KeyboardAction.backAction)]
]);
trainingEditScene.enter((ctx) => __awaiter(void 0, void 0, void 0, function* () {
    ctx.scene.state.requested = Requested.none;
    buildMenu(ctx);
}));
function buildMenu(ctx, newMessage = false) {
    const event = ctx.session.selectedEvent;
    const localizedDate = `${event.date.getStringFullDate()}, ${event.date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
    let text = `*Информация о тренировке:*\n
Имя: ${event.name}
Дата и время: ${localizedDate}
Адресс: ${event.address}
Кол-во мест: ${event.capacity}
Стоимость: ${event.price} ₽`;
    let extra = keyboard.extra();
    extra.parse_mode = "Markdown";
    if (newMessage)
        ctx.reply(text, extra);
    else
        ctx.editMessageText(text, extra);
}
trainingEditScene.action(KeyboardAction.backAction, (ctx) => {
    ctx.scene.enter(scenes_1.Scene.trainingPage);
});
trainingEditScene.action(KeyboardAction.editTrainingName, (ctx) => {
    ctx.scene.state.requested = Requested.name;
    ctx.reply(`Введите новое название:`);
});
trainingEditScene.action(KeyboardAction.editTrainingCapacity, (ctx) => {
    ctx.scene.state.requested = Requested.capacity;
    ctx.reply(`Введите новое кол-во мест:`);
});
trainingEditScene.action(KeyboardAction.editTrainingPrice, (ctx) => {
    ctx.scene.state.requested = Requested.price;
    ctx.reply(`Введите новую стоимость:`);
});
trainingEditScene.action(KeyboardAction.editTrainingDate, (ctx) => {
    ctx.scene.state.requested = Requested.date;
    ctx.reply(`Введите новую дату:`);
});
trainingEditScene.action(KeyboardAction.editTrainingLocation, (ctx) => {
    ctx.scene.state.requested = Requested.location;
    ctx.reply(`Введите новый адресс:`);
});
trainingEditScene.on('text', (ctx, next) => {
    var _a;
    const text = ((_a = ctx.message) === null || _a === void 0 ? void 0 : _a.text) || '';
    let message = '';
    let haveToUpdate = false;
    switch (ctx.scene.state.requested) {
        case Requested.name:
            const name = text;
            if (name == '') {
                message = `Неверный формат.\nВы указали: ${name}`;
            }
            else {
                ctx.session.selectedEvent.name = name;
                haveToUpdate = true;
                message = `Название успешно изменено.`;
            }
            break;
        case Requested.date:
            const date = text.splitByTimeAndDate();
            if (date == undefined || !date.isValid()) {
                message = 'Неверный формат данных. (HH:MM DD:MM)';
            }
            else if (date < new Date()) {
                const humanReadableDate = `${date.toLocaleTimeString()} ${date.toLocaleDateString()}`;
                message = `Нельзя указывать прошедшую дату.\nВы указали: ${humanReadableDate}`;
            }
            else {
                ctx.session.selectedEvent.date = date;
                haveToUpdate = true;
                message = `Дата успешно изменена.`;
            }
            break;
        case Requested.location:
            const address = text;
            if (address == '') {
                message = `Неверный формат.\nВы указали: ${address}`;
            }
            else {
                ctx.session.selectedEvent.address = address;
                haveToUpdate = true;
                message = `Адресс успешно изменен.`;
            }
            break;
        case Requested.capacity:
            const capacity = Number.parseInt(text);
            if (isNaN(capacity) || capacity <= 0) {
                message = `Неверный формат. Кол-во мест должно быть числом, больше нуля.\nВы указали: ${text}`;
            }
            else {
                ctx.session.selectedEvent.capacity = capacity;
                haveToUpdate = true;
                message = `Кол-во мест успешно изменено.`;
            }
            break;
        case Requested.price:
            const price = Number.parseFloat(text);
            if (isNaN(price) || price < 0) {
                message = `Неверный формат. Цена должна быть числом, больше или равно нулю.\nВы указали: ${text}`;
            }
            else {
                ctx.session.selectedEvent.price = price;
                haveToUpdate = true;
                message = `Цена успешно изменена.`;
            }
            break;
        case Requested.none:
        default:
            message = 'Выберите параметр для изменения';
            break;
    }
    if (haveToUpdate) {
        events_model_1.EventModel.updateOne({ '_id': ctx.session.selectedEvent._id }, ctx.session.selectedEvent).exec((error) => __awaiter(void 0, void 0, void 0, function* () {
            if (error)
                return; // handle error
            ctx.scene.state.requested = Requested.none;
            buildMenu(ctx, true);
        }));
    }
    else {
        ctx.reply(message);
    }
});
trainingEditScene.action(KeyboardAction.deleteTraining, (ctx) => {
    const buttons = telegraf_1.Markup.inlineKeyboard([
        [telegraf_1.Markup.callbackButton('Нет', KeyboardAction.cancelDeleting),
            telegraf_1.Markup.callbackButton('Да', KeyboardAction.confirmDeleting)]
    ]);
    ctx.editMessageText('Вы уверены что хотите удалить эту тренировку?', buttons.extra());
});
trainingEditScene.action(KeyboardAction.confirmDeleting, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    let event = ctx.session.selectedEvent;
    let eventId = event._id;
    events_model_1.EventModel.findByIdAndDelete(eventId).exec((error) => __awaiter(void 0, void 0, void 0, function* () {
        bookings_model_1.BookingModel.deleteMany({ 'eventId': eventId }).exec((error) => __awaiter(void 0, void 0, void 0, function* () {
            if (error)
                return; // todo handle error
            ctx.deleteMessage();
            ctx.reply('Тренировка успешно удалена.\nИспользуйте команду /menu').then(() => ctx.scene.enter(scenes_1.Scene.schedule));
        }));
    }));
}));
trainingEditScene.action(KeyboardAction.cancelDeleting, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    ctx.scene.reenter();
}));
exports.default = trainingEditScene;
//# sourceMappingURL=edit.js.map