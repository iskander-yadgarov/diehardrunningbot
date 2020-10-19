"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingModel = void 0;
const mongoose_1 = require("mongoose");
const bookings_schema_1 = __importDefault(require("./bookings.schema"));
exports.BookingModel = mongoose_1.model('booking', bookings_schema_1.default);
//# sourceMappingURL=bookings.model.js.map