import { BaseScene, Markup, Extra } from "telegraf"
import { SceneContextMessageUpdate } from "telegraf/typings/stage"
import strings from '../../resources/strings'
import { Scene } from "../scenes"

enum KeyboardAction {
  startBooking = 'start_booking'
}

const introScene = new BaseScene(Scene.intro)

const keyboard = Markup.inlineKeyboard([
    [Markup.callbackButton(strings.start_screen.buttons.start_booking, KeyboardAction.startBooking, false)]
  ])

introScene.enter(async (ctx: SceneContextMessageUpdate) => {
    await ctx.reply(strings.start_screen.message, keyboard.extra())
})

introScene.action(KeyboardAction.startBooking, (ctx: SceneContextMessageUpdate) => { 
  let message = ctx.chat?.id.toString() || ''
  message += '\n'
  message += ctx.from?.first_name || ''
  message += '\n'
  message += ctx.from?.last_name || ''
  message += '\n'
  message += ctx.from?.username || ''

  ctx.editMessageText(message)
  // ctx.scene.enter(Scene)
})

export default introScene