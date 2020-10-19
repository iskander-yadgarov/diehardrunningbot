"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = __importDefault(require("../env"));
let database;
const connectionURL = `mongodb+srv://${env_1.default.DB_USER}:${env_1.default.DB_PASSWORD}@${env_1.default.DB_HOST}/${env_1.default.DB_NAME}?retryWrites=true&w=majority`;
function connect(completion) {
    if (database) {
        console.log('database already connected');
        completion(Error());
        return;
    }
    mongoose_1.default.connect(connectionURL, {
        useNewUrlParser: true,
        useFindAndModify: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        autoIndex: env_1.default.isDevelopment
    });
    database = mongoose_1.default.connection;
    database.once('open', () => {
        console.log('connected to database');
        completion();
    });
    database.on('error', (error) => {
        console.log(`error connecting to database: ${error}`);
        completion(error);
    });
}
function disconnect() {
    if (!database) {
        console.log('trying to disconnect database without connection');
        return;
    }
    mongoose_1.default.disconnect();
}
exports.default = { connect, disconnect };
//# sourceMappingURL=index.js.map