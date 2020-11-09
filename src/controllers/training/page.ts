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

const markdown = Extra.markdown()

enum KeyboardAction {
    // book, back, list
    bookTraining = 'book_training',
    cancelTraining = 'cancel_training',
    backAction = 'back_action',
    showAll = 'show_users',
    // payment_cancel = 'payment_cancel',

    // admin: edit
    editTraining = 'edit_training',
}

/*
const invoice: NewInvoiceParameters = {
    provider_token: '401643678:TEST:7426ec98-bf19-4a9d-84bd-94af19084cb7',
    start_parameter: 'workout-coupon',
    title: 'Запись на тренировку',
    description: 'Только оплатив тренировку вы бронируете за собой место ☝️😌',//  Бронь отменить нельзя, но если на тренировку не набереться Х человек, то тренер имеет право ее отменить. В этом случае вы получите купон на бесплатную тренировку.
    currency: 'rub',
    prices: [
        { label: '1 Тренировка', amount: 80000 }
    ],
    payload: 'DieHardCore'
}
*/

const trainingPageScene = new BaseScene(Scene.trainingPage)

const backButton = Markup.callbackButton(strings.general.back, KeyboardAction.backAction)
const bookButton = Markup.callbackButton(strings.training_page.buttons.book_training, KeyboardAction.bookTraining)
const cancelButton = Markup.callbackButton(strings.training_page.buttons.cancel_training, KeyboardAction.cancelTraining)
const listButton = Markup.callbackButton(strings.training_page.buttons.list_training, KeyboardAction.showAll)
const editButton = Markup.callbackButton(strings.training_page.buttons.change_training, KeyboardAction.editTraining)

// let initialText: string
// let keyboardExtra: ExtraReplyMessage

trainingPageScene.enter(async (ctx: SceneContextMessageUpdate) => {

    if (ctx.chat == undefined) return
    const userId = ctx.chat.id.toString()
    let event = ctx.session.selectedEvent as any

    const alreadyPassed = new Date() > event.date
    const capacity: number = event.capacity
    const initPrice: number = event.price

    // const discount = (await UserModel.findOne({'chatId': userId}).exec())?.discount.valueOf() || 0
    // const userPrice = (1 - discount) * event.price

    // check if already booked and count all participents
    BookingModel.find({ eventId: event._id }).exec(async (error, bookings) => {
        if (error) return // todo handle error

        let alreadyBooked = false
        for (let b of bookings) {
            if (b.userId == userId) {
                alreadyBooked = true
                break
            }
        };

        let initialText = `*Информация о тренировке:*\n
Тренировка: ${event.name}
Дата: ${event.date.getStringDate()}
Время: ${event.date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
Локация: ${event.address}
Стоимость: ${initPrice} ₽`

        let keyboards = []
        const hasSpace = (bookings.length < capacity)
        if (alreadyPassed) {
            initialText += `\n\nЭта тренировка уже в прошлом...`
            initialText += `\nПрисутствовало: ${bookings.length} человек`
        } else if (alreadyBooked || hasSpace) {
            initialText += `\n\nЗаписалось: ${bookings.length}/${capacity}`
            keyboards.push([alreadyBooked ? cancelButton : bookButton])
        } else {
            initialText += `\n\nНет свободных мест 😭`
        }
        keyboards.push([listButton])
        if (UserManager.isAdmin(userId) && !alreadyPassed) {
            keyboards.push([editButton])
        }
        keyboards.push([backButton])

        const extra = Markup.inlineKeyboard(keyboards).extra()
        extra.parse_mode = 'Markdown'

        ctx.editMessageText(initialText, extra)
    })
})

trainingPageScene.action(KeyboardAction.backAction, (ctx: SceneContextMessageUpdate) => {
    ctx.scene.enter(Scene.schedule)
})

trainingPageScene.action(KeyboardAction.bookTraining, (ctx: SceneContextMessageUpdate) => {

    if (ctx.chat == undefined) return

    let userId = ctx.chat.id.toString()
    let event = ctx.session.selectedEvent as any
    let eventId = event._id as String

    // check if we already have this booking
    BookingModel.find({ 'eventId': eventId }).exec(async (error, bookings) => {
        if (error) return // todo handle error

        if (bookings.find(b => b.userId == userId)) {
            ctx.reply(`Вы уже записались на эту тренировку 😊`)
        } else if (bookings.length >= event.capacity) {
            // no space
            ctx.reply(`Извини, но мест уже нет 😭`)
        } else {
            // const discount = (await UserModel.findOne({'chatId': userId}).exec())?.discount?.valueOf() || 0
            // const userPrice = Math.ceil((1 - discount) * event.price)

            // if (userPrice > 80) { // TODO check for minimal price for invoice (76,83 RUB)
            //     let paymentButtons = Markup.inlineKeyboard([
            //         [Markup.payButton(`Оплатить ${userPrice} RUB`),
            //         Markup.callbackButton('Отменить', KeyboardAction.payment_cancel)]
            //     ]).extra() as ExtraInvoice // 🤬🤬🤬🤬🤬 потратил час на этот каст

            //     invoice.prices[0].amount = userPrice * 100
            //     ctx.replyWithInvoice(invoice, paymentButtons)
            // }

            // create new Booking
            const booking = {
                userId: userId,
                eventId: eventId,
                status: 1
            }

            // do we need 'await' here?
            BookingModel.create(booking).then(_ => {
                // ctx.reply(`Ждем тебя на тренировке. 😉`)
                ctx.scene.reenter()
            })
        }
    })
})

trainingPageScene.action(KeyboardAction.cancelTraining, async (ctx: SceneContextMessageUpdate) => {
    if (ctx.chat == undefined) return

    let userId = ctx.chat.id.toString()
    let eventId = (ctx.session.selectedEvent as any)._id as String

    const _ = await BookingModel.deleteOne({'eventId': eventId, 'userId': userId}).exec()
    ctx.scene.reenter()
})

trainingPageScene.action(KeyboardAction.showAll, (ctx: SceneContextMessageUpdate) => {
    ctx.scene.enter(Scene.userListPage)
})

// PAYMENTS
/*
trainingPageScene.on('pre_checkout_query', (ctx) => {
    let data = ctx.update.pre_checkout_query
    console.log('pre_checkout_query')
    console.log(data)
    console.log('\n\n')
    ctx.answerPreCheckoutQuery(true)
        .then(() => {
            ctx.reply('Thanks for the purchase!')
        })
})

// trainingPageScene.on('pre_checkout_query', ({ answerPreCheckoutQuery }) => answerPreCheckoutQuery(true))

trainingPageScene.on('successful_payment', (ctx: SceneContextMessageUpdate) => {
    console.log('successful_payment')
    console.log(ctx.update.message?.successful_payment)
    console.log('\n\n')
})


trainingPageScene.action(KeyboardAction.payment_cancel, (ctx: SceneContextMessageUpdate) => {
    ctx.deleteMessage()
})
*/


// admin actions

trainingPageScene.action(KeyboardAction.editTraining, async (ctx: SceneContextMessageUpdate) => {
    ctx.scene.enter(Scene.trainingEdit)
})


function generateKeyboardBasedOn(showToBook: boolean, admin: boolean) {
    let keyboard = showToBook ? [[backButton, bookButton]] : [[backButton]]
    keyboard.push([listButton])

    if (admin) {
        keyboard.push([editButton])
    }

    return Markup.inlineKeyboard(keyboard)
}

export default trainingPageScene
