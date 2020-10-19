import Telegraf, { Stage, session } from "telegraf"
import { Commands } from './commandDescription'
import { UserManager } from "../managers/user"
import { SceneContextMessageUpdate } from "telegraf/typings/stage"
import { Scene } from '../controllers/scenes'

export function myCommandsMiddleware(ctx: SceneContextMessageUpdate, next: Function) {
    if (ctx.updateType != 'message' || !ctx.updateSubTypes.includes('text')) { return next() }

    const text = ctx.message?.text || ''

    switch (text) {
        case `/${Commands.create}`: {
            const chatId = ctx.chat?.id.toString()

            if (UserManager.isAdmin(chatId)) {
                ctx.scene.enter(Scene.createEvent)
            } else {
                return next()
            }

            break
        }
        default: {
            return next()
        }
    }

}