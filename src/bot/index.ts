import Telegraf, { Stage } from "telegraf"
import { SceneContextMessageUpdate } from "telegraf/typings/stage"
import { Scene } from './../controllers/scenes'
import env from '../env'
import { setupCommandsDesctiption } from '../middlewares/commandDescription'
import { myCommandsMiddleware } from "../middlewares/myCommandsMiddleware"
const { TelegrafMongoSession } = require('telegraf-session-mongodb');

// scenes
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

const bot = new Telegraf(env.TELEGRAM_TOKEN)

const stages = new Stage([
    introScene,
    // menuScene,
    scheduleScene,
    createEventScene,
    createDiscountScene,
    trainingPageScene,
    trainingEditScene,
    // userTrainingScene,
    userListScene,
    archiveScene
], { default: Scene.schedule })

const dbURL = `mongodb+srv://${env.DB_USER}:${env.DB_PASSWORD}@${env.DB_HOST}/${env.DB_NAME}?retryWrites=true&w=majority`
TelegrafMongoSession.setup(bot, dbURL)
  .catch((err: any) => console.log(`Failed to connect to the database: ${err}`));

stages.use(myCommandsMiddleware)

stages.command('menu', (ctx: SceneContextMessageUpdate) => ctx.scene.enter(Scene.schedule))

stages.command('debug', (ctx) => ctx.reply('Your session: ' + JSON.stringify(ctx.session, null, 2)))

stages.command('remove', (ctx) => { ctx.session = null })

bot.use(stages.middleware())

bot.start(setupCommandsDesctiption)
// payment callback
// bot.on('pre_checkout_query', ({ answerPreCheckoutQuery }) => answerPreCheckoutQuery(true)) // todo check if the current scene is trainingPage

bot.start((ctx: SceneContextMessageUpdate) => {
    ctx.scene.enter(Scene.intro)
})

export async function launch() { bot.launch() }
