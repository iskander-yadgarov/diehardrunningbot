"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.launch = void 0;
const telegraf_1 = __importStar(require("telegraf"));
const scenes_1 = require("./../controllers/scenes");
const env_1 = __importDefault(require("../env"));
const commandDescription_1 = require("../middlewares/commandDescription");
const myCommandsMiddleware_1 = require("../middlewares/myCommandsMiddleware");
const { TelegrafMongoSession } = require('telegraf-session-mongodb');
// scenes
const intro_1 = __importDefault(require("../controllers/intro"));
const schedule_1 = __importDefault(require("../controllers/schedule"));
const create_event_1 = __importDefault(require("../controllers/create-event"));
const discount_1 = __importDefault(require("../controllers/discount/discount"));
const page_1 = __importDefault(require("../controllers/training/page"));
const edit_1 = __importDefault(require("../controllers/training/edit"));
const list_1 = __importDefault(require("../controllers/training/list"));
const archive_1 = __importDefault(require("../controllers/archive/archive"));
const bot = new telegraf_1.default(env_1.default.TELEGRAM_TOKEN);
const stages = new telegraf_1.Stage([
    intro_1.default,
    // menuScene,
    schedule_1.default,
    create_event_1.default,
    discount_1.default,
    page_1.default,
    edit_1.default,
    // userTrainingScene,
    list_1.default,
    archive_1.default
], { default: scenes_1.Scene.schedule });
const dbURL = `mongodb+srv://${env_1.default.DB_USER}:${env_1.default.DB_PASSWORD}@${env_1.default.DB_HOST}/${env_1.default.DB_NAME}?retryWrites=true&w=majority`;
TelegrafMongoSession.setup(bot, dbURL)
    .catch((err) => console.log(`Failed to connect to the database: ${err}`));
stages.use(myCommandsMiddleware_1.myCommandsMiddleware);
stages.command('menu', (ctx) => ctx.scene.enter(scenes_1.Scene.schedule));
stages.command('debug', (ctx) => ctx.reply('Your session: ' + JSON.stringify(ctx.session, null, 2)));
stages.command('remove', (ctx) => { ctx.session = null; });
bot.use(stages.middleware());
bot.start(commandDescription_1.setupCommandsDesctiption);
// payment callback
// bot.on('pre_checkout_query', ({ answerPreCheckoutQuery }) => answerPreCheckoutQuery(true)) // todo check if the current scene is trainingPage
bot.start((ctx) => {
    ctx.scene.enter(scenes_1.Scene.intro);
});
function launch() {
    return __awaiter(this, void 0, void 0, function* () { bot.launch(); });
}
exports.launch = launch;
//# sourceMappingURL=index.js.map