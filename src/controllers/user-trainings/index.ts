import Telegraf, { BaseScene, Markup, Extra } from "telegraf"
import { SceneContextMessageUpdate } from "telegraf/typings/stage"
import strings from '../../resources/strings'
import { Scene, SceneManager } from '../scenes'
import { BookingModel } from '../../models/bookings/bookings.model'
import { EventModel } from "../../models/events/events.model"
import { isValidObjectId, Mongoose } from "mongoose"
import { CallbackButton } from "telegraf/typings/markup"

enum KeyboardAction {
    openTraining = 'open_training-',
    back = 'back_action'
}

const trainingScene = new BaseScene(Scene.userTrainings)

const backKeyboard = [Markup.callbackButton(strings.general.back, KeyboardAction.back)]

trainingScene.enter(async (ctx: SceneContextMessageUpdate) => {
    console.log('trainingScene enter')
    if (!ctx.chat) return // todo handle error
    let userId = ctx.chat.id.toString()
    
    BookingModel.find({'userId': userId}).exec(async (error, bookings) => {
        if (error) return // todo handle error

        // handle if no bookings for this user
        if (bookings.length == 0) {
            ctx.editMessageText('У вас пока нет записей на тренировки :(', Markup.inlineKeyboard([backKeyboard]).extra())
            return
        }

        let ids: String[] = []
        bookings.forEach(booking => {
            if (booking.eventId) {
                ids.push(booking.eventId)
            }
        });

        EventModel.find({ '_id': { $in: ids }, 'date': {$gte: new Date().addHours(-1)} }).sort('date').exec(async (error, events) => {
            if (error) { console.log(error); return } // handle error
            let trainingsBtns: CallbackButton[][] = []
            events.forEach(event => {
                
                let localizedDate = `${event.date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} ${event.date.getStringFullDate()}`
                let btn = [Markup.callbackButton(localizedDate, KeyboardAction.openTraining + event._id)]
                trainingsBtns.push(btn)
            });

            trainingsBtns.push(backKeyboard)
            ctx.editMessageText('Тренировки на которые ты записан:', Markup.inlineKeyboard(trainingsBtns).extra())
        })
    })
})

trainingScene.action(new RegExp(`^${KeyboardAction.openTraining}`), async (ctx: SceneContextMessageUpdate) => {
    let data = ctx.callbackQuery?.data
    let id = data?.split('-')[1]

    EventModel.findById(id).exec(async (error, event) => {
        if (error || !event) return // todo handle errors

        SceneManager.enter(ctx, Scene.trainingPage, (event as any)._doc)
    })
})

trainingScene.action(KeyboardAction.back, async (ctx: SceneContextMessageUpdate) => {
    SceneManager.back(ctx)
})

export default trainingScene
