"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.myCommandsMiddleware = void 0;
const commandDescription_1 = require("./commandDescription");
const user_1 = require("../managers/user");
const scenes_1 = require("../controllers/scenes");
function myCommandsMiddleware(ctx, next) {
    var _a, _b;
    if (ctx.updateType != 'message' || !ctx.updateSubTypes.includes('text')) {
        return next();
    }
    const text = ((_a = ctx.message) === null || _a === void 0 ? void 0 : _a.text) || '';
    switch (text) {
        case `/${commandDescription_1.Commands.create}`: {
            const chatId = (_b = ctx.chat) === null || _b === void 0 ? void 0 : _b.id.toString();
            if (user_1.UserManager.isAdmin(chatId)) {
                ctx.scene.enter(scenes_1.Scene.createEvent);
            }
            else {
                return next();
            }
            break;
        }
        default: {
            return next();
        }
    }
}
exports.myCommandsMiddleware = myCommandsMiddleware;
//# sourceMappingURL=myCommandsMiddleware.js.map