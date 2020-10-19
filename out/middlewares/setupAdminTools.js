"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupCommandsDesctiption = exports.Commands = void 0;
const user_1 = require("../managers/user");
var Commands;
(function (Commands) {
    // admins
    Commands["create"] = "create";
    // users
    Commands["menu"] = "menu";
})(Commands = exports.Commands || (exports.Commands = {}));
const adminCommands = [{ command: Commands.create, description: 'создать новую запись на тренировку' }];
const userCommands = [{ command: Commands.menu, description: 'перейти в главное меню' }];
function setupCommandsDesctiption(ctx, next) {
    var _a;
    let commands = userCommands;
    if (user_1.UserManager.isAdmin((_a = ctx.chat) === null || _a === void 0 ? void 0 : _a.id.toString())) {
        commands = commands.concat(adminCommands);
    }
    ctx.telegram.setMyCommands(commands);
    return next();
}
exports.setupCommandsDesctiption = setupCommandsDesctiption;
//# sourceMappingURL=setupAdminTools.js.map