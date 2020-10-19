import { BaseScene, Markup, Extra } from "telegraf"
import { SceneContextMessageUpdate } from "telegraf/typings/stage"
import strings from '../../resources/strings'
import { Scene, SceneManager } from '../scenes'
import { BookingModel } from '../../models/bookings/bookings.model'
import { IEvent } from '../../models/events/events.types'
import { InlineKeyboardMarkup } from "telegraf/typings/telegram-types"
import { UserManager } from "../../managers/user"
import trainingScene from "../user-trainings"
import { UserModel } from "../../models/users/users.model"
import { EventModel } from "../../models/events/events.model"

enum Requested {
    none = 'none',
    name = 'name',
    capacity = 'capacity',
    price = 'price',
    date = 'date',
    location = 'location'
}

enum KeyboardAction {
    editTrainingName = 'edit_training_name',
    editTrainingCapacity = 'edit_training_capacity',
    editTrainingPrice = 'edit_training_price',
    editTrainingDate = 'edit_training_date',
    editTrainingLocation = 'edit_training_location',
    deleteTraining = 'delete_training',
    backAction = 'back',

    confirmDeleting = 'confirm_delete',
    cancelDeleting = 'cancel_delete'
}

const trainingEditScene = new BaseScene(Scene.trainingEdit)
// let requested: Requested = Requested.none
// let eventToEdit: IEvent

const keyboard = Markup.inlineKeyboard([
    [Markup.callbackButton('Изменить имя', KeyboardAction.editTrainingName)],
    [Markup.callbackButton('Изменить время/дату', KeyboardAction.editTrainingDate)],
    [Markup.callbackButton('Изменить адресс', KeyboardAction.editTrainingLocation)],
    [Markup.callbackButton('Изменить кол-во мест', KeyboardAction.editTrainingCapacity)],
    [Markup.callbackButton('Изменить стоимость', KeyboardAction.editTrainingPrice)],
    [Markup.callbackButton('Удалить', KeyboardAction.deleteTraining)],
    [Markup.callbackButton(strings.general.back, KeyboardAction.backAction)]
]);


trainingEditScene.enter(async (ctx: SceneContextMessageUpdate) => {
    ctx.session.eventToEdit = ctx.scene.state as IEvent
    if (ctx.session.eventToEdit == undefined) {
        SceneManager.back(ctx)
        return
    }
    ctx.session.requested = Requested.none
    // ctx.session.event 
    buildMenu(ctx)
})

function buildMenu(ctx: SceneContextMessageUpdate, newMessage: boolean = false) {
    const event = ctx.session.eventToEdit
    const localizedDate = `${event.date.getStringFullDate()}, ${event.date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`

    let text = `*Информация о тренировке:*\n
Имя: ${event.name}
Дата и время: ${localizedDate}
Адресс: ${event.address}
Кол-во мест: ${event.capacity}
Стоимость: ${event.price} ₽`

    let extra = keyboard.extra()
    extra.parse_mode = "Markdown"

    if (newMessage)
        ctx.reply(text, extra)
    else
        ctx.editMessageText(text, extra)
}

trainingEditScene.action(KeyboardAction.backAction, (ctx: SceneContextMessageUpdate) => {
    SceneManager.back(ctx, ctx.scene.state as object)
})

trainingEditScene.action(KeyboardAction.editTrainingName, (ctx: SceneContextMessageUpdate) => {
    ctx.session.requested = Requested.name
    ctx.reply(`Введите новое название:`)
})

trainingEditScene.action(KeyboardAction.editTrainingCapacity, (ctx: SceneContextMessageUpdate) => {
    ctx.session.requested = Requested.capacity
    ctx.reply(`Введите новое кол-во мест:`)
})

trainingEditScene.action(KeyboardAction.editTrainingPrice, (ctx: SceneContextMessageUpdate) => {
    ctx.session.requested = Requested.price
    ctx.reply(`Введите новую стоимость:`)
})

trainingEditScene.action(KeyboardAction.editTrainingDate, (ctx: SceneContextMessageUpdate) => {
    ctx.session.requested = Requested.date
    ctx.reply(`Введите новую дату:`)
})

trainingEditScene.action(KeyboardAction.editTrainingLocation, (ctx: SceneContextMessageUpdate) => {
    ctx.session.requested = Requested.location
    ctx.reply(`Введите новый адресс:`)
})

trainingEditScene.on('text', (ctx: SceneContextMessageUpdate, next: Function) => {
    const text = ctx.message?.text || ''
    let message = ''
    let haveToUpdate = false

    switch (ctx.session.requested) {
        case Requested.name:
            const name = text
            if (name == '') {
                message = `Неверный формат.\nВы указали: ${name}`
            } else {
                ctx.session.eventToEdit.name = name
                haveToUpdate = true
                message = `Название успешно изменено.`
            }
            break
        case Requested.date:
            const date = text.splitByTimeAndDate()

            if (date == undefined) {
                message = 'Неверный формат данных. (HH:MM DD:MM)'
            } else if (date < new Date()) {
                const humanReadableDate = `${date.toLocaleTimeString()} ${date.toLocaleDateString()}`
                message = `Нельзя указывать прошедшую дату.\nВы указали: ${humanReadableDate}`
            } else {
                ctx.session.eventToEdit.date = date
                haveToUpdate = true
                message = `Дата успешно изменена.`
            }
            break
        case Requested.location:
            const address = text
            if (address == '') {
                message = `Неверный формат.\nВы указали: ${address}`
            } else {
                ctx.session.eventToEdit.address = address
                haveToUpdate = true
                message = `Адресс успешно изменен.`
            }
            break
        case Requested.capacity:
            const capacity = Number.parseInt(text)
            if (isNaN(capacity) || capacity <= 0) {
                message = `Неверный формат. Кол-во мест должно быть числом, больше нуля.\nВы указали: ${text}`
            } else {
                ctx.session.eventToEdit.capacity = capacity
                haveToUpdate = true
                message = `Кол-во мест успешно изменено.`
            }
            break
        case Requested.price:
            const price = Number.parseFloat(text)
            if (isNaN(price) || price < 0) {
                message = `Неверный формат. Цена должна быть числом, больше или равно нулю.\nВы указали: ${text}`
            } else {
                ctx.session.eventToEdit.price = price
                haveToUpdate = true
                message = `Цена успешно изменена.`
            }
            break
        case Requested.none:
            message = 'Выберите параметр для изменения'
            return
    }

    if (haveToUpdate) {
        EventModel.updateOne({ '_id': (ctx.session.eventToEdit as any)._id }, ctx.session.eventToEdit).exec(async (error) => {
            if (error) return // handle error
            // ctx.reply(message)
            ctx.session.requested = Requested.none
            buildMenu(ctx, true)
        })
    } else {
        ctx.reply(message)
    }
})


trainingEditScene.action(KeyboardAction.deleteTraining, (ctx: SceneContextMessageUpdate) => {
    const buttons = Markup.inlineKeyboard([
        [Markup.callbackButton('Да', KeyboardAction.confirmDeleting),
        Markup.callbackButton('Нет', KeyboardAction.cancelDeleting)]
    ]);

    ctx.editMessageText('Вы уверены что хотите удалить эту тренировку?', buttons.extra())
    // ctx.reply('Вы уверены что хотите удалить эту тренировку?', Markup.keyboard(['Да', 'Нет'], { columns: 2 }).oneTime(true).resize().extra())
})

trainingEditScene.action(KeyboardAction.confirmDeleting, async (ctx: SceneContextMessageUpdate) => {

    let event = ctx.scene.state as any
    let eventId = event._id as String

    EventModel.findByIdAndDelete(eventId).exec(async (error) => {
        BookingModel.deleteMany({ 'eventId': eventId }).exec(async (error) => {
            if (error) return // todo handle error

            ctx.deleteMessage()
            ctx.reply('Тренировка успешно удалена.').then(() => SceneManager.back(ctx))

        })
    })
})

trainingEditScene.action(KeyboardAction.cancelDeleting, async (ctx: SceneContextMessageUpdate) => {
    SceneManager.back(ctx)
})



export default trainingEditScene