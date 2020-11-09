import { BaseScene, Markup, Extra } from "telegraf"
import { SceneContextMessageUpdate } from "telegraf/typings/stage"
import strings from '../../resources/strings'
import { Scene } from '../scenes'
import { BookingModel } from '../../models/bookings/bookings.model'
import { IEvent } from '../../models/events/events.types'
import { ExtraInvoice, ExtraReplyMessage, InlineKeyboardMarkup, NewInvoiceParameters } from "telegraf/typings/telegram-types"
import { KeyboardOptions } from "telegraf/typings/markup"
import { UserManager } from "../../managers/user"
import trainingScene from "../user-trainings"
import { UserModel } from "../../models/users/users.model"
import { EventModel } from "../../models/events/events.model"

enum KeyboardAction {
    back = 'back-action'
}

const userListScene = new BaseScene(Scene.userListPage)

const keyboard = Markup.inlineKeyboard([
    Markup.callbackButton('Назад', KeyboardAction.back)
]).extra()
keyboard.parse_mode = "Markdown"

userListScene.enter(async (ctx: SceneContextMessageUpdate) => {
    let event = ctx.session.selectedEvent as any
    let eventId = event._id as String

    BookingModel.find({ 'eventId': eventId }).exec((error, bookings) => {
        if (error) return // todo handle error

        let ids: String[] = []
        bookings.forEach(booking => {
            if (booking.userId) {
                ids.push(booking.userId)
            }
        });

        UserModel.find({ 'chatId': { $in: ids } }).exec((error, users) => {
            if (error) return // todo handle error

            let listOfUsers = ''
            let index = 0
            if (users.length > 0) {
                listOfUsers = '*Участники:*'

                users.forEach(u => {
                    listOfUsers += `\n${++index}. ${u.firstName} ${u.lastName}`
                })
            } else {
                listOfUsers = 'Пока никто не записался.'
            }

            ctx.editMessageText(listOfUsers, keyboard)
            ctx.answerCbQuery()
        })
    })
})

userListScene.action(KeyboardAction.back, (ctx: SceneContextMessageUpdate) => {
    ctx.scene.enter(Scene.trainingPage)
})

export default userListScene
