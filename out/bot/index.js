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
const intro_1 = __importDefault(require("../controllers/intro"));
const menu_1 = __importDefault(require("../controllers/menu/menu"));
const schedule_1 = __importDefault(require("../controllers/schedule"));
const create_event_1 = __importDefault(require("../controllers/create-event"));
const discount_1 = __importDefault(require("../controllers/discount/discount"));
const page_1 = __importDefault(require("../controllers/training/page"));
const edit_1 = __importDefault(require("../controllers/training/edit"));
const user_trainings_1 = __importDefault(require("../controllers/user-trainings"));
const list_1 = __importDefault(require("../controllers/training/list"));
const archive_1 = __importDefault(require("../controllers/archive/archive"));
const env_1 = __importDefault(require("../env"));
const commandDescription_1 = require("../middlewares/commandDescription");
const myCommandsMiddleware_1 = require("../middlewares/myCommandsMiddleware");
const LocalSession = require('telegraf-session-local');
const bot = new telegraf_1.default(env_1.default.TELEGRAM_TOKEN);
const stages = new telegraf_1.Stage([
    intro_1.default,
    menu_1.default,
    schedule_1.default,
    create_event_1.default,
    discount_1.default,
    page_1.default,
    edit_1.default,
    user_trainings_1.default,
    list_1.default,
    archive_1.default
], { default: scenes_1.Scene.menu });
// bot.use((ctx: SceneContextMessageUpdate, next: Function) => {
//     // console.log(ctx)
//     return next()
// })
bot.use((new LocalSession({ database: 'example_db.json', format: {
        serialize: (obj) => JSON.stringify(obj, null, 2),
        deserialize: (str) => {
            let obj = JSON.parse(str);
            console.log(Object.keys(obj.sessions));
            return obj;
        },
    } })).middleware());
stages.use(myCommandsMiddleware_1.myCommandsMiddleware);
stages.command('menu', (ctx) => scenes_1.SceneManager.open(ctx, scenes_1.Scene.intro));
// bot.use(session())
bot.use(stages.middleware());
bot.command('count', (ctx) => {
    ctx.session.counter = ctx.session.counter || 0;
    ctx.session.counter++;
    return ctx.reply(`Message counter: ${ctx.session.counter}`);
});
// examples
// bot.on('text', (ctx, next) => {
//   ctx.session.counter = ctx.session.counter || 0
//   ctx.session.counter++
//   ctx.replyWithMarkdown(`Counter updated, new value: \`${ctx.session.counter}\``)
//   return next()
// })
bot.command('/debug', (ctx) => {
    console.log(ctx.session);
});
// bot.command('/stats', (ctx) => {
//   ctx.replyWithMarkdown(`Database has \`${ctx.session.counter}\` messages from @${ctx.from?.username || ctx.from?.id}`)
// })
bot.command('/remove', (ctx) => {
    ctx.reply(`Removing session from database:`, ctx.session);
    // Setting session to null, undefined or empty object/array will trigger removing it from database
    ctx.session = null;
});
bot.start(commandDescription_1.setupCommandsDesctiption);
// bot.on('pre_checkout_query', ({ answerPreCheckoutQuery }) => answerPreCheckoutQuery(true)) // todo check if the current scene is trainingPage
bot.start((ctx) => {
    scenes_1.SceneManager.open(ctx, scenes_1.Scene.intro);
});
// const { MongoClient } = require('mongodb');
// let sessioncustom: any;
// bot.use((...args) => sessioncustom.middleware(...args));
// const app = new Telegraf(process.env.BOT_TOKEN);
// MongoClient.connect('mongodb+srv://yadgarov:pc319hRzYq5KbSgf@diehardcore.fsgg5.mongodb.net/db?retryWrites=true&w=majority', (error: any ,client: any) => {
//             console.log(error)
//             console.log(client)
//         const session = new MongoSession(client);
//             // ttl - in milliseconds
//             // property - name of the context property for the session (default: session)
//             // collection - name of the mongodb collection for the sessions (default: sessions)
//             // getSessionKey - function (ctx) => String (default "chatId:fromId")
//         // Setup function creates necessary indexes for ttl and key lookup
//         session.setup().then(() => {
//             bot.use(session.middleware);
//             bot.command("session", (ctx) => {
//                 ctx.replyWithHTML(`<pre>${ctx.session, null, 2}</pre>`);
//             });
//         });
// })
//.catch((error:any) => console.log(`Failed to connect to the database: ${error}`));
function launch() {
    return __awaiter(this, void 0, void 0, function* () {
        bot.launch({ polling: { timeout: 2 } });
        //     TelegrafMongoSession.setup(bot, 'mongodb+srv://yadgarov:pc319hRzYq5KbSgf@diehardcore.fsgg5.mongodb.net/diehardcoredb?retryWrites=true&w=majority',)
        //   .then((client:any) => {console.log('db startup', client); bot.launch({ polling: { timeout: 2 } })})
        //   .catch((err:any) => console.log(`Failed to connect to the database: ${err}`));
        // bot.launch({ polling: { timeout: 2 } })
    });
}
exports.launch = launch;
//# sourceMappingURL=index.js.map