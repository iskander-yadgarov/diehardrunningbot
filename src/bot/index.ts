import Telegraf, { Stage, session, Context } from "telegraf"
import { SceneContextMessageUpdate } from "telegraf/typings/stage"
import Scene from '../controllers/scenes'
import introScene from "../controllers/intro"
import startScene from '../controllers/start'
import createEventScene from '../controllers/create-event'
import env from '../env'
import { UserManager } from "../managers/user"
import { UserModel } from "../models/users/users.model"
import { setupAdminTools } from '../middlewares/setupAdminTools'

const bot = new Telegraf(env.TELEGRAM_TOKEN)

const stages = new Stage([
    introScene,
    startScene,
    createEventScene
])

bot.use(session())
bot.use(stages.middleware())

bot.start(setupAdminTools)
bot.start((ctx: SceneContextMessageUpdate) => {
    ctx.scene.enter(Scene.intro)
})

export async function launch() {
    bot.launch({ polling: { timeout: 2 } })
}

// admin actions

    bot.command('create', (ctx: SceneContextMessageUpdate) => {
        const chatId = ctx.chat?.id.toString()

        if (UserManager.isAdmin(chatId)) {
            console.log('create new event')

            ctx.scene.enter(Scene.createEvent)
        }
    
    })