import { BaseScene, Markup, Extra } from "telegraf"
import { SceneContextMessageUpdate } from "telegraf/typings/stage"
import strings from '../../resources/strings'
import { Scene } from '../scenes'
import { UserModel } from '../../models/users/users.model'
import { IUser, IUserDocument } from "../../models/users/users.types"
import { CallbackButton } from "telegraf/typings/markup"

enum KeyboardAction {
  ready = 'ready',
  select = 'select-'
}

const introScene = new BaseScene(Scene.intro)

const confirmNameKeyboard = Markup.inlineKeyboard(
  [Markup.callbackButton('Погнали 💪', KeyboardAction.ready)]
).extra()

introScene.enter(async (ctx: SceneContextMessageUpdate) => {

  const firstName = ctx.from?.first_name
  ctx.reply(`Привет, ${firstName}!\n\n${strings.intro_scene.message}`, confirmNameKeyboard)
})

introScene.action(new RegExp(`^${KeyboardAction.select}`), async (ctx: SceneContextMessageUpdate) => {

})

/*   let promise = CityModel.find({}).exec()
  let cities = await promise
  if (!cities) return;

  ctx.scene.state.cities = cities
  let buttons: CallbackButton[][] = [];
  for (let i = 0; i < cities.length; i++) {
    var button = [Markup.callbackButton(cities[i].name.toString(), KeyboardAction.select + i)]
    buttons.push(button)
  }; */

introScene.action(KeyboardAction.ready, async (ctx: SceneContextMessageUpdate) => {
  const chatId = ctx.chat?.id.toString()
  if (!chatId) return

  let promise1 = UserModel.find({ chatId: chatId }).exec()
  // const users = await promise

  let users = await promise1
  if (users === undefined) { console.log(`error for fetching user ${chatId}`); }
  if (users.length > 1) { console.log('multiple users with the same id'); return }
  // console.log(promise)
  // const user = users[0]
  if (users[0] != undefined) {
    ctx.scene.enter(Scene.citySelector)
  } else {
    const user = {
      chatId: chatId,
      firstName: ctx.from?.first_name || '',
      lastName: ctx.from?.last_name || '',
      discount: 0
    }

    const promise = UserModel.create(user).then(newUser => {
      ctx.scene.enter(Scene.citySelector)
    })
  }
})

/*
introScene.action(KeyboardAction.accept, async (ctx: SceneContextMessageUpdate) => {
  const chatId = ctx.chat?.id.toString()
  if (!chatId) { return }

  // todo check if we have first and last names from default
  ctx.state.waitingForName = true
  ctx.state.userName = (ctx.from?.first_name || '') + ' ' + (ctx.from?.last_name || '')
  ctx.state.lastMessageText = `Давай познакомимся.\n\nТвое имя ${ctx.state.userName}, все верно?\n\nЕсли нет, то напиши как ты хочешь чтобы к тебе обращались.`
  ctx.state.lastMessageId = (await ctx.reply(ctx.state.lastMessageText, confirmNameKeyboard)).message_id
})

introScene.on('text', async (ctx: SceneContextMessageUpdate) => {
  if (!ctx.state.waitingForName) return

  const text = ctx.message?.text || ''
  const names = text.split(' ')

  if (names.length != 2) {
    ctx.reply('Не чуди, напиши пожалуйста только свое имя и фамилию через пробел.')
  } else {
    ctx.telegram.editMessageText(ctx.chat!.id, ctx.state.lastMessageId, undefined, ctx.state.lastMessageText)
    ctx.state.userName = text
    ctx.reply(`${names[0]} ${names[1]}, все верно?`, confirmNameKeyboard)
  }
})

introScene.action(KeyboardAction.name_confirm, async (ctx: SceneContextMessageUpdate) => {
  const chatId = ctx.chat?.id.toString()
  if (!chatId) { return }

  ctx.state.waitingForName = false
  let names = ctx.state.userName.split(' ')

  const user = {
    chatId: chatId,
    firstName: names[0] || '',
    lastName: names[1] || '',
    discount: 0
  }

  UserModel.create(user).then(newUser => {
    ctx.state.userModel = newUser
    ctx.reply(`Отлично, ${user.firstName}, больше никаких вопросов!`, Markup.inlineKeyboard(
      [Markup.callbackButton('В меню', KeyboardAction.menu)]
    ).extra())
  })
})
*/

export default introScene
