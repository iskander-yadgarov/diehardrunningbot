"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiscountModel = void 0;
const mongoose_1 = require("mongoose");
const discounts_schema_1 = __importDefault(require("./discounts.schema"));
exports.DiscountModel = mongoose_1.model('discount', discounts_schema_1.default);
//# sourceMappingURL=discounts.model.js.map