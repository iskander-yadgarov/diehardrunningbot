require('dotenv').config()
import Telegraf, { Stage, session } from "telegraf"
import introScene from "../controllers/intro"
import { SceneContextMessageUpdate } from "telegraf/typings/stage"
import { Scene } from '../controllers/scenes'

let bot = new Telegraf(process.env.TELEGRAM_TOKEN ?? "")

const stages = new Stage([
    introScene
])

bot.use(session())
bot.use(stages.middleware())

bot.start((ctx: SceneContextMessageUpdate) => {
    ctx.scene.enter(Scene.intro)

})

export async function launch() {
    bot.launch({ polling: { timeout: 2 } })
}