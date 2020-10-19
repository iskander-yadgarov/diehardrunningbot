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
const authorizationScene = new telegraf_1.BaseScene(scenes_1.Scene.authorization);
authorizationScene.enter((ctx) => __awaiter(void 0, void 0, void 0, function* () {
    // ctx.editMessageText(message)
    // await UserModel.create({
    //     chatId: ctx.chat?.id.toString() || '',
    //     firstName: ctx.from?.first_name || '',
    //     lastName: ctx.from?.last_name || ''
    // })
}));
//# sourceMappingURL=index.js.map