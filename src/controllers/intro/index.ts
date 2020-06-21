import { BaseScene, Markup, Extra } from "telegraf"
import { SceneContextMessageUpdate } from "telegraf/typings/stage"
import strings from '../../resources/strings'
import Scene from "../scenes"
import { UserModel } from '../../models/users/users.model'
import { IUser } from "../../models/users/users.types"

enum KeyboardAction {
  startBooking = 'start_booking'
}

const introScene = new BaseScene(Scene.intro)

const keyboard = Markup.inlineKeyboard([
    [Markup.callbackButton(strings.intro_scene.buttons.go_to_start_scene, KeyboardAction.startBooking, false)]
  ])

introScene.enter(async (ctx: SceneContextMessageUpdate) => {
    await ctx.reply(strings.intro_scene.message, keyboard.extra())
})

introScene.action(KeyboardAction.startBooking, async (ctx: SceneContextMessageUpdate) => {  
  const chatId = ctx.chat?.id.toString()
  
  if (!chatId) { return }

  UserModel.find({ userId: chatId }).exec( async (error, users) => {
    if (error) { console.log(`error for fetching user ${chatId }: ${error}`); return }
    if (users.length > 1) { console.log('multiple users with the same id') }

    const user = users[0]

    if (user != undefined) {
      /// go to start scene
      ctx.scene.enter(Scene.start, { user: user })
    } else {
      // ctx.scene.enter(Scene.authorization, { user: user })
      
      /// go to authorization scene
      const user = {
        userId: chatId,
        firstName: ctx.from?.first_name || '',
        lastName: ctx.from?.last_name || ''
      }
      
      await UserModel.create(user).then(newUser => {
        console.log(`created new user: ${newUser}`)
        ctx.scene.enter(Scene.start, { user: newUser })
      })
    }

  })

})

export default introScene