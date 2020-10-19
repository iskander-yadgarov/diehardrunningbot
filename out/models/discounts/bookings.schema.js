"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const BookingSchema = new mongoose_1.Schema({
    userId: String,
    eventId: String,
    status: Number
});
exports.default = BookingSchema;
//# sourceMappingURL=bookings.schema.js.map