import Telegraf, { Stage, session } from "telegraf"
import { SceneContextMessageUpdate } from "telegraf/typings/stage"
import Scene from '../controllers/scenes'
import introScene from "../controllers/intro"
import startScene from '../controllers/start'
import createEventScene from '../controllers/create-event'
import env from '../env'
import { setupAdminTools } from '../middlewares/setupAdminTools'
import { myCommandsMiddleware } from "../middlewares/myCommandsMiddleware"

const bot = new Telegraf(env.TELEGRAM_TOKEN)

const stages = new Stage([
    introScene,
    startScene,
    createEventScene
])

stages.use(myCommandsMiddleware)

bot.on('callback_query', (ctx: SceneContextMessageUpdate, next: Function) => {
    console.log(`on ${ctx.scene}`)
    return next()
})

bot.use((ctx: SceneContextMessageUpdate, next: Function) => {
    console.log('use')
    return next()
})

bot.use(session())
bot.use(stages.middleware())

bot.start(setupAdminTools)
bot.start((ctx: SceneContextMessageUpdate) => {
    ctx.scene.enter(Scene.intro)
})

export async function launch() {
    bot.launch({ polling: { timeout: 2 } })
}