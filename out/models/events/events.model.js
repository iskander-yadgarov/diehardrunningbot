"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventModel = void 0;
const mongoose_1 = require("mongoose");
const events_schema_1 = __importDefault(require("./events.schema"));
exports.EventModel = mongoose_1.model('event', events_schema_1.default);
//# sourceMappingURL=events.model.js.map