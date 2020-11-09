"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const telegraf_1 = require("telegraf");
const strings_1 = __importDefault(require("../../resources/strings"));
const scenes_1 = require("../scenes");
const user_1 = require("../../managers/user");
const menuScene = new telegraf_1.BaseScene(scenes_1.Scene.menu);
var KeyboardAction;
(function (KeyboardAction) {
    KeyboardAction["schedule"] = "open_schedule";
    KeyboardAction["my_bookings"] = "open_my_bookings";
    KeyboardAction["test"] = "test-page";
    // admin's
    KeyboardAction["archive"] = "open_archive";
    KeyboardAction["create_event"] = "create_event";
    KeyboardAction["create_discount"] = "create_discount";
})(KeyboardAction || (KeyboardAction = {}));
const userBtns = [
    [telegraf_1.Markup.callbackButton(strings_1.default.menu_scene.buttons.my_bookings, KeyboardAction.my_bookings),
        telegraf_1.Markup.callbackButton(strings_1.default.menu_scene.buttons.schedule, KeyboardAction.schedule)],
];
const adminBtns = [
    [telegraf_1.Markup.callbackButton(strings_1.default.menu_scene.buttons.create_event, KeyboardAction.create_event),
        telegraf_1.Markup.callbackButton(strings_1.default.menu_scene.buttons.archive, KeyboardAction.archive)]
    // Markup.callbackButton(strings.menu_scene.buttons.create_discount, KeyboardAction.create_discount)]
];
menuScene.enter((ctx) => {
    console.log('enter in menu');
    if (ctx.chat == undefined)
        return;
    let userId = ctx.chat.id.toString();
    let keyboards = userBtns;
    if (user_1.UserManager.isAdmin(userId)) {
        keyboards = keyboards.concat(adminBtns);
    }
    const extra = telegraf_1.Markup.inlineKeyboard(keyboards).extra();
    extra.parse_mode = "Markdown";
    if (ctx.updateType == 'message') {
        ctx.reply(strings_1.default.menu_scene.message, extra);
    }
    else {
        ctx.editMessageText(strings_1.default.menu_scene.message, extra);
    }
});
menuScene.action(KeyboardAction.schedule, (ctx) => ctx.scene.enter(scenes_1.Scene.schedule));
menuScene.action(KeyboardAction.my_bookings, (ctx) => ctx.scene.enter(scenes_1.Scene.userTrainings));
menuScene.action(KeyboardAction.archive, (ctx) => ctx.scene.enter(scenes_1.Scene.archiveScene));
menuScene.action(KeyboardAction.create_event, (ctx) => ctx.scene.enter(scenes_1.Scene.createEvent));
menuScene.action(KeyboardAction.create_discount, (ctx) => ctx.scene.enter(scenes_1.Scene.discountSettings));
exports.default = menuScene;
//# sourceMappingURL=menu.js.map