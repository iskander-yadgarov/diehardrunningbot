import { BaseScene } from "telegraf"
import { SceneContextMessageUpdate } from "telegraf/typings/stage"
import strings from '../../resources/strings'
import { Scene, SceneManager } from '../scenes'

const authorizationScene = new BaseScene(Scene.authorization)

authorizationScene.enter(async (ctx: SceneContextMessageUpdate) => {
    // ctx.editMessageText(message)

    // await UserModel.create({
    //     chatId: ctx.chat?.id.toString() || '',
    //     firstName: ctx.from?.first_name || '',
    //     lastName: ctx.from?.last_name || ''
    // })
})