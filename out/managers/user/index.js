"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserManager = void 0;
var UserManager;
(function (UserManager) {
    function isAdmin(userId) {
        return userId === '111326630' || userId === '180314551';
    }
    UserManager.isAdmin = isAdmin;
})(UserManager = exports.UserManager || (exports.UserManager = {}));
//# sourceMappingURL=index.js.map