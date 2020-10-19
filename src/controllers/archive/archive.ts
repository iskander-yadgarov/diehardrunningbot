import { BaseScene, Markup, Extra } from "telegraf"
import { SceneContextMessageUpdate } from "telegraf/typings/stage"
import EventSchema from "../../models/events/events.schema"
import { EventModel } from "../../models/events/events.model"
import strings from '../../resources/strings'
import { Scene, SceneManager } from '../scenes'
import { IEvent } from "../../models/events/events.types"
import { NativeDate } from "mongoose"
import { CallbackButton } from "telegraf/typings/markup"
import { UserModel } from "../../models/users/users.model"
import { BookingModel } from "../../models/bookings/bookings.model"
import { IBookingDocument } from "../../models/bookings/bookings.types"
import { InlineKeyboardButton } from "telegraf/typings/telegram-types"

enum KeyboardAction {
    back = 'back_action',
    openTraining = 'open_training-',
}

const archiveScene = new BaseScene(Scene.archiveScene)

const backKeyboard = [Markup.callbackButton(strings.general.back, KeyboardAction.back, false)]

archiveScene.enter((ctx: SceneContextMessageUpdate) => {

    EventModel.find({'date': {$lt: new Date()}}).sort('date').exec(async (error, events) => {
        if (error) { console.log(`error for fetching events in archive: ${error}`); return }
        console.log('passed events:', events)

        let dynamicBtns = []
        events.forEach(e => {
            const localizedDate = `${e.date.getStringDayMonth()} ${e.date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`
            let btn = [Markup.callbackButton(localizedDate, KeyboardAction.openTraining + e._id, false)]
            dynamicBtns.push(btn)
        })

        if (dynamicBtns.length > 0) {
            dynamicBtns.push(backKeyboard)
            ctx.editMessageText('Тренировки которые уже проведены:', Markup.inlineKeyboard(dynamicBtns).extra())

        } else {
            ctx.editMessageText('Тут будут отображаться проведенные тренировки...', Markup.inlineKeyboard(backKeyboard).extra())
        }
    })
})

archiveScene.action(new RegExp(`^${KeyboardAction.openTraining}`), (ctx: SceneContextMessageUpdate) => {
    let data = ctx.callbackQuery?.data
    let id = data?.split('-')[1]

    EventModel.findOne({ '_id': id }).exec(async (error, event) => {
        if (error || !event || !ctx.chat) return // todo handle errors
        // console.log(event)
        // let chatId = ctx.chat.id.toString()

        // go to scene 'pageTraining'
        SceneManager.enter(ctx, Scene.trainingPage, (event as any)._doc)
    })
})

archiveScene.action(KeyboardAction.back, (ctx: SceneContextMessageUpdate) => {
    SceneManager.back(ctx)
})

export default archiveScene