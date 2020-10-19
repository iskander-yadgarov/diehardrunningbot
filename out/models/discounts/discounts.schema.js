"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const DiscountSchema = new mongoose_1.Schema({
    userId: String,
    amount: Number
});
exports.default = DiscountSchema;
//# sourceMappingURL=discounts.schema.js.map