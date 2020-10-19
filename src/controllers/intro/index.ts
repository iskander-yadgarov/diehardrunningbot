import { BaseScene, Markup, Extra } from "telegraf"
import { SceneContextMessageUpdate } from "telegraf/typings/stage"
import strings from '../../resources/strings'
import { Scene, SceneManager } from '../scenes'
import { UserModel } from '../../models/users/users.model'
import { IUser, IUserDocument } from "../../models/users/users.types"
import { EventModel } from "../../models/events/events.model"
import { Collection } from "mongoose"

enum KeyboardAction {
  accept = 'accept_action',
  name_confirm = 'name_confirm',
  menu = 'go_to_menu'
}

const introScene = new BaseScene(Scene.intro)

const confirmNameKeyboard = Markup.inlineKeyboard(
  [Markup.callbackButton('Все верно 👌', KeyboardAction.name_confirm)]
).extra()

// let userName = ''
// let waitingForName: boolean
// let userModel: IUserDocument
// let lastMessageId: number
// let lastMessageText: string


introScene.enter(async (ctx: SceneContextMessageUpdate) => {

  const chatId = ctx.chat?.id.toString()
  if (!chatId) return

  ctx.session.userName = ''
  ctx.session.waitingForName = false
  ctx.session.userModel = undefined
  ctx.session.lastMessageId = undefined
  ctx.session.lastMessageText = undefined
  
  // properly should be moved to Model class, but I don't know how to do it here 🤦‍♂️
  UserModel.find({ chatId: chatId }).exec( async (error, users) => {
    if (error) { console.log(`error for fetching user ${chatId }: ${error}`); return }
    if (users.length > 1) { console.log('multiple users with the same id') }

    const user = users[0]

    if (user != undefined) {
      // open menu scene
      SceneManager.open(ctx, Scene.menu, { user: user })
    } else {
      // show intro messages and wait for reply
      ctx.reply(strings.intro_scene.message, Markup.inlineKeyboard([
        [Markup.callbackButton(strings.intro_scene.buttons.accept_action, KeyboardAction.accept)]
      ]).extra())
    }
  })
})


introScene.action(KeyboardAction.accept, async (ctx: SceneContextMessageUpdate) => {  
  const chatId = ctx.chat?.id.toString()
  if (!chatId) { return }

  // todo check if we have first and last names from default
  ctx.session.waitingForName = true
  ctx.session.userName = (ctx.from?.first_name || '') + ' ' + (ctx.from?.last_name || '')
  ctx.session.lastMessageText = `Давай познакомимся.\n\nТвое имя ${ctx.session.userName}, все верно?\n\nЕсли нет, то напиши как ты хочешь чтобы к тебе обращались.`
  ctx.session.lastMessageId = (await ctx.reply(ctx.session.lastMessageText, confirmNameKeyboard)).message_id
})

introScene.on('text', async (ctx: SceneContextMessageUpdate) => {
  if (!ctx.session.waitingForName) return

  const text = ctx.message?.text || ''
  const names = text.split(' ')

  if (names.length != 2) {
    ctx.reply('Не чуди, напиши пожалуйста только свое имя и фамилию через пробел.')
  } else {
    ctx.telegram.editMessageText(ctx.chat!.id, ctx.session.lastMessageId, undefined, ctx.session.lastMessageText)
    ctx.session.userName = text
    ctx.reply(`${names[0]} ${names[1]}, все верно?`, confirmNameKeyboard)
  }
})

introScene.action(KeyboardAction.name_confirm, async (ctx: SceneContextMessageUpdate) => {
  const chatId = ctx.chat?.id.toString()
  if (!chatId) { return }
  
  ctx.session.waitingForName = false
  let names = ctx.session.userName.split(' ')
  
  const user = {
    chatId: chatId,
    firstName: names[0] || '',
    lastName: names[1] || '',
    discount: 0
  }      
  
  UserModel.create(user).then(newUser => {
    ctx.session.userModel = newUser
    ctx.reply(`Отлично, ${user.firstName}, больше никаких вопросов!`, Markup.inlineKeyboard(
      [Markup.callbackButton('В меню', KeyboardAction.menu)]
    ).extra())
  })
})

introScene.action(KeyboardAction.menu, async (ctx: SceneContextMessageUpdate) => {
  SceneManager.open(ctx, Scene.menu, ctx.session.userModel)
})


export default introScene