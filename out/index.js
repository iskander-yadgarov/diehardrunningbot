"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bot_1 = require("./bot");
const db_1 = __importDefault(require("./db"));
require("./extensions/date.extension");
require("./extensions/string.extension");
const express_1 = __importDefault(require("express"));
// Create a new express app instance
const app = express_1.default();
app.get(`/`, function (req, res) {
    res.send(`Hello World!`);
});
app.listen(process.env.PORT || 3000, function () {
    console.log(`App is listening on port 3000!`);
});
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
db_1.default.connect((error) => {
    if (error !== undefined) {
        console.log('failed connect to database' + error);
        process.exit(1);
    }
    bot_1.launch();
});
//# sourceMappingURL=index.js.map