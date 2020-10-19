"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const EventSchema = new mongoose_1.Schema({
    name: String,
    description: String,
    address: String,
    date: Date,
    capacity: Number,
    price: Number
});
exports.default = EventSchema;
//# sourceMappingURL=events.schema.js.map