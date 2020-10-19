import Telegraf, { Stage, Extra, Markup } from "telegraf"
import { SceneContext, SceneContextMessageUpdate } from "telegraf/typings/stage"
import { Scene, SceneManager } from './../controllers/scenes'
import introScene from "../controllers/intro"
import menuScene from "../controllers/menu/menu"
import scheduleScene from '../controllers/schedule'
import createEventScene from '../controllers/create-event'
import createDiscountScene from '../controllers/discount/discount'
import trainingPageScene from '../controllers/training/page'
import trainingEditScene from '../controllers/training/edit'
import userTrainingScene from '../controllers/user-trainings'
import userListScene from '../controllers/training/list'
import archiveScene from '../controllers/archive/archive'
import env from '../env'
import { setupCommandsDesctiption } from '../middlewares/commandDescription'
import { myCommandsMiddleware } from "../middlewares/myCommandsMiddleware"

const LocalSession = require('telegraf-session-local')

const bot = new Telegraf(env.TELEGRAM_TOKEN)

const stages = new Stage([
    introScene,
    menuScene,
    scheduleScene,
    createEventScene,
    createDiscountScene,
    trainingPageScene,
    trainingEditScene,
    userTrainingScene,
    userListScene,
    archiveScene
])

// bot.use((ctx: SceneContextMessageUpdate, next: Function) => {
//     // console.log(ctx)
//     return next()
// })

bot.use((new LocalSession({ database: 'example_db.json', format: {
    serialize: (obj: any) => JSON.stringify(obj, null, 2), // null & 2 for pretty-formatted JSON
    deserialize: (str: string) => {
        let obj = JSON.parse(str)
        console.log(Object.keys(obj.sessions))
        return obj
    },
  }})).middleware())
stages.use(myCommandsMiddleware)

stages.command('menu', (ctx: SceneContextMessageUpdate) => SceneManager.open(ctx, Scene.intro))



// bot.use(session())
bot.use(stages.middleware())

bot.command('count', (ctx) => {
    ctx.session.counter = ctx.session.counter || 0
    ctx.session.counter++
    return ctx.reply(`Message counter: ${ctx.session.counter}`)
})

// examples

 
// bot.on('text', (ctx, next) => {
//   ctx.session.counter = ctx.session.counter || 0
//   ctx.session.counter++
//   ctx.replyWithMarkdown(`Counter updated, new value: \`${ctx.session.counter}\``)
//   return next()
// })

bot.command('/debug', (ctx) => {
  console.log(ctx.session)
})
 
// bot.command('/stats', (ctx) => {
//   ctx.replyWithMarkdown(`Database has \`${ctx.session.counter}\` messages from @${ctx.from?.username || ctx.from?.id}`)
// })
 
bot.command('/remove', (ctx) => {
  ctx.reply(`Removing session from database:`, ctx.session)
  // Setting session to null, undefined or empty object/array will trigger removing it from database
  ctx.session = null
})

bot.start(setupCommandsDesctiption)
// bot.on('pre_checkout_query', ({ answerPreCheckoutQuery }) => answerPreCheckoutQuery(true)) // todo check if the current scene is trainingPage

bot.start((ctx: SceneContextMessageUpdate) => {
    SceneManager.open(ctx, Scene.intro)
})



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


export async function launch() {

    bot.launch({ polling: { timeout: 2 } })

//     TelegrafMongoSession.setup(bot, 'mongodb+srv://yadgarov:pc319hRzYq5KbSgf@diehardcore.fsgg5.mongodb.net/diehardcoredb?retryWrites=true&w=majority',)
//   .then((client:any) => {console.log('db startup', client); bot.launch({ polling: { timeout: 2 } })})
//   .catch((err:any) => console.log(`Failed to connect to the database: ${err}`));
    // bot.launch({ polling: { timeout: 2 } })
}