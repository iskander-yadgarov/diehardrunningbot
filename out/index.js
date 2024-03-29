"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bot_1 = require("./bot");
const db_1 = __importDefault(require("./db"));
require("./extensions/date.extension");
require("./extensions/string.extension");
// process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const express = require('express');
const expressApp = express();
const port = process.env.PORT || 3000;
expressApp.get('/', (req, res) => {
    res.send('It is Die Hard Core!');
});
expressApp.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
db_1.default.connect((error) => {
    if (error !== undefined) {
        console.log('failed connect to database' + error);
        process.exit(1);
    }
    bot_1.launch();
});
//# sourceMappingURL=index.js.map