"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const UserSchema = new mongoose_1.Schema({
    chatId: String,
    firstName: String,
    lastName: String,
    discount: Number
});
exports.default = UserSchema;
//# sourceMappingURL=users.schema.js.map