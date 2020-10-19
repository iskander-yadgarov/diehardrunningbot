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
const events_model_1 = require("../../models/events/events.model");
var Request;
(function (Request) {
    Request["none"] = "none";
    Request["date"] = "date";
    Request["name"] = "name";
    Request["location"] = "location";
    Request["price"] = "price";
    Request["capacity"] = "capacity";
})(Request || (Request = {}));
var KeyboardAction;
(function (KeyboardAction) {
    KeyboardAction["cancel"] = "cancel";
    KeyboardAction["publish"] = "publish";
    KeyboardAction["retry"] = "retry";
    KeyboardAction["menu"] = "menu";
})(KeyboardAction || (KeyboardAction = {}));
const createEventScene = new telegraf_1.BaseScene(scenes_1.Scene.createEvent);
const keyboardPlain = telegraf_1.Markup.inlineKeyboard([
    [telegraf_1.Markup.callbackButton('Отменить', KeyboardAction.cancel)]
]);
const keyboardCompleted = telegraf_1.Markup.inlineKeyboard([
    [telegraf_1.Markup.callbackButton('Отменить', KeyboardAction.cancel),
        telegraf_1.Markup.callbackButton('Опубликовать', KeyboardAction.publish)]
]);
const postKeyboard = telegraf_1.Markup.inlineKeyboard([
    [telegraf_1.Markup.callbackButton('Создать еще', KeyboardAction.retry)],
    [telegraf_1.Markup.callbackButton('Главное меню', KeyboardAction.menu)]
]);
createEventScene.enter((ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const nextRequest = nextRequestFor(undefined);
    ctx.session.createEventState = nextRequest;
    ctx.session.rawEvent = {};
    if (ctx.updateType == 'callback_query') {
        ctx.deleteMessage();
    }
    ctx.session.lastMessageText = eventDescription(undefined) + '\n' + requestDescription(nextRequest);
    ctx.session.lastMessageId = (yield ctx.reply(ctx.session.lastMessageText, keyboardPlain.extra())).message_id;
}));
createEventScene.leave((ctx) => {
    ctx.session.createEventState = {};
});
createEventScene.action(KeyboardAction.cancel, (ctx) => {
    ctx.session.createEventState = undefined;
    ctx.session.rawEvent = undefined;
    scenes_1.SceneManager.open(ctx, scenes_1.Scene.intro);
    // ctx.editMessageText('Создание отменено.', postKeyboard.extra())
});
createEventScene.action(KeyboardAction.retry, (ctx) => {
    ctx.scene.reenter();
});
createEventScene.action(KeyboardAction.menu, (ctx) => {
    scenes_1.SceneManager.open(ctx, scenes_1.Scene.intro);
});
createEventScene.action(KeyboardAction.publish, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    // publish training
    // get event from context
    let event = ctx.session.rawEvent;
    // todo check if valid
    events_model_1.EventModel.create(event).then(_ => {
        ctx.editMessageText(`Отлично, событие опубликовано 👍`, postKeyboard.extra());
    });
}));
createEventScene.on('text', (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const text = ((_a = ctx.message) === null || _a === void 0 ? void 0 : _a.text) || '/';
    const state = ctx.session.createEventState;
    if (text[0] == '/')
        return;
    let event = ctx.session.rawEvent;
    let message = '';
    switch (state) {
        case Request.date: {
            const date = text.splitByTimeAndDate(); //splitByTimeAndDate(text)
            if (date == undefined) {
                message = 'Неверный формат данных';
            }
            else {
                const localizedDate = `${date.getStringFullDate()}, ${date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
                if (date < new Date()) {
                    message = `Нельзя указывать прошедшую дату.\nВы указали: ${localizedDate}`;
                }
                else {
                    event.date = date;
                    const nextRequest = nextRequestFor(event);
                    ctx.session.createEventState = nextRequest;
                    message = eventDescription(event) + '\n' + requestDescription(nextRequest);
                }
            }
            break;
        }
        case Request.name: {
            event.name = text;
            const nextRequest = nextRequestFor(event);
            ctx.session.createEventState = nextRequest;
            message = eventDescription(event) + '\n' + requestDescription(nextRequest);
            break;
        }
        case Request.location: {
            event.address = text;
            const nextRequest = nextRequestFor(event);
            ctx.session.createEventState = nextRequest;
            message = eventDescription(event) + '\n' + requestDescription(nextRequest);
            break;
        }
        case Request.price: {
            const price = Number.parseFloat(text);
            if (isNaN(price) || price < 0) {
                message = `Неверный формат. Цена должна быть числом, больше или равно нулю.\nВы указали: ${text}`;
            }
            else {
                event.price = price;
                const nextRequest = nextRequestFor(event);
                ctx.session.createEventState = nextRequest;
                message = eventDescription(event) + '\n' + requestDescription(nextRequest);
            }
            break;
        }
        case Request.capacity: {
            const capacity = Number.parseInt(text);
            if (isNaN(capacity) || capacity <= 0) {
                message = `Неверный формат. Кол-во должно быть числом больше нуля.\nВы указали: ${text}`;
            }
            else {
                event.capacity = capacity;
                const nextRequest = nextRequestFor(event);
                ctx.session.createEventState = nextRequest;
                message = eventDescription(event) + '\n' + requestDescription(nextRequest);
            }
            break;
        }
        case Request.none: {
            message = eventDescription(event) + '\n' + requestDescription(state);
            break;
        }
        default:
            return;
    }
    // remove inline keyboards from previous message
    ctx.telegram.editMessageText(ctx.chat.id, ctx.session.lastMessageId, undefined, ctx.session.lastMessageText);
    ctx.session.lastMessageText = message;
    ctx.session.lastMessageId = (yield ctx.reply(message, ctx.session.createEventState == Request.none ? keyboardCompleted.extra() : keyboardPlain.extra())).message_id;
    ctx.session.rawEvent = event;
    return next();
}));
function eventDescription(event) {
    if (event === undefined) {
        return '🔥 Новое событие 🔥\n';
    }
    let description = '';
    if (event.name !== undefined && event.name.length > 0) {
        description += `Событие: ${event.name}\n`;
    }
    if (event.date !== undefined) {
        const localizedDate = `${event.date.getStringFullDate()}, ${event.date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
        description += `Дата: ${localizedDate}\n`;
    }
    if (event.address !== undefined && event.address.length > 0) {
        description += `Локация: ${event.address}\n`;
    }
    if (event.price !== undefined) {
        description += `Стоимость: ${event.price} ₽\n`;
    }
    if (event.capacity !== undefined) {
        description += `Кол-во мест: ${event.capacity}`;
    }
    return description;
}
function requestDescription(request) {
    switch (request) {
        case Request.name:
            return 'Введите имя события:';
        case Request.date:
            return 'Введите дату (формат HH:MM DD MM):';
        case Request.location:
            return 'Введите локацию:';
        case Request.price:
            return 'Введите стоимость (₽):';
        case Request.capacity:
            return 'Введите кол-во мест:';
        case Request.none:
            return 'Событие готово к публикации';
    }
}
function nextRequestFor(event) {
    if (event == undefined || event.date === undefined) {
        return Request.date;
    }
    else if (event.name === undefined || event.name == '') {
        return Request.name;
    }
    else if (event.address === undefined) {
        return Request.location;
    }
    else if (event.price === undefined) {
        return Request.price;
    }
    else if (event.capacity === undefined) {
        return Request.capacity;
    }
    else {
        return Request.none;
    }
}
exports.default = createEventScene;
//# sourceMappingURL=index.js.map