import { BaseScene, Markup, Extra } from "telegraf"
import { SceneContextMessageUpdate } from "telegraf/typings/stage"
import strings from '../../resources/strings'
import { Scene } from '../scenes'
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
    ctx.scene.state.requested = Requested.none
    buildMenu(ctx)
})

function buildMenu(ctx: SceneContextMessageUpdate, newMessage: boolean = false) {
    const event = ctx.session.selectedEvent
    const localizedDate = `${event.date.getStringFullDate()}, ${event.date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}`

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
    ctx.scene.enter(Scene.trainingPage)
})

trainingEditScene.action(KeyboardAction.editTrainingName, (ctx: SceneContextMessageUpdate) => {
    ctx.scene.state.requested = Requested.name
    ctx.reply(`Введите новое название:`)
})

trainingEditScene.action(KeyboardAction.editTrainingCapacity, (ctx: SceneContextMessageUpdate) => {
    ctx.scene.state.requested = Requested.capacity
    ctx.reply(`Введите новое кол-во мест:`)
})

trainingEditScene.action(KeyboardAction.editTrainingPrice, (ctx: SceneContextMessageUpdate) => {
    ctx.scene.state.requested = Requested.price
    ctx.reply(`Введите новую стоимость:`)
})

trainingEditScene.action(KeyboardAction.editTrainingDate, (ctx: SceneContextMessageUpdate) => {
    ctx.scene.state.requested = Requested.date
    ctx.reply(`Введите новую дату:`)
})

trainingEditScene.action(KeyboardAction.editTrainingLocation, (ctx: SceneContextMessageUpdate) => {
    ctx.scene.state.requested = Requested.location
    ctx.reply(`Введите новый адресс:`)
})

trainingEditScene.on('text', (ctx: SceneContextMessageUpdate, next: Function) => {
    const text = ctx.message?.text || ''
    let message = ''
    let haveToUpdate = false

    switch (ctx.scene.state.requested) {
        case Requested.name:
            const name = text
            if (name == '') {
                message = `Неверный формат.\nВы указали: ${name}`
            } else {
                ctx.session.selectedEvent.name = name
                haveToUpdate = true
                message = `Название успешно изменено.`
            }
            break
        case Requested.date:
            const date = text.splitByTimeAndDate()

            if (date == undefined || !date.isValid()) {
                message = 'Неверный формат данных. (HH:MM DD:MM)'
            } else if (date < new Date()) {
                const humanReadableDate = `${date.toLocaleTimeString()} ${date.toLocaleDateString()}`
                message = `Нельзя указывать прошедшую дату.\nВы указали: ${humanReadableDate}`
            } else {
                ctx.session.selectedEvent.date = date
                haveToUpdate = true
                message = `Дата успешно изменена.`
            }
            break
        case Requested.location:
            const address = text
            if (address == '') {
                message = `Неверный формат.\nВы указали: ${address}`
            } else {
                ctx.session.selectedEvent.address = address
                haveToUpdate = true
                message = `Адресс успешно изменен.`
            }
            break
        case Requested.capacity:
            const capacity = Number.parseInt(text)
            if (isNaN(capacity) || capacity <= 0) {
                message = `Неверный формат. Кол-во мест должно быть числом, больше нуля.\nВы указали: ${text}`
            } else {
                ctx.session.selectedEvent.capacity = capacity
                haveToUpdate = true
                message = `Кол-во мест успешно изменено.`
            }
            break
        case Requested.price:
            const price = Number.parseFloat(text)
            if (isNaN(price) || price < 0) {
                message = `Неверный формат. Цена должна быть числом, больше или равно нулю.\nВы указали: ${text}`
            } else {
                ctx.session.selectedEvent.price = price
                haveToUpdate = true
                message = `Цена успешно изменена.`
            }
            break
        case Requested.none:
        default:
            message = 'Выберите параметр для изменения'
            break
    }

    if (haveToUpdate) {
        EventModel.updateOne({ '_id': (ctx.session.selectedEvent as any)._id }, ctx.session.selectedEvent).exec(async (error) => {
            if (error) return // handle error
            ctx.scene.state.requested = Requested.none
            buildMenu(ctx, true)
        })
    } else {
        ctx.reply(message)
    }
})


trainingEditScene.action(KeyboardAction.deleteTraining, (ctx: SceneContextMessageUpdate) => {
    const buttons = Markup.inlineKeyboard([
        [Markup.callbackButton('Нет', KeyboardAction.cancelDeleting),
        Markup.callbackButton('Да', KeyboardAction.confirmDeleting)]
    ]);

    ctx.editMessageText('Вы уверены что хотите удалить эту тренировку?', buttons.extra())
})

trainingEditScene.action(KeyboardAction.confirmDeleting, async (ctx: SceneContextMessageUpdate) => {

    let event = ctx.session.selectedEvent as any
    let eventId = event._id as String

    EventModel.findByIdAndDelete(eventId).exec(async (error) => {
        BookingModel.deleteMany({ 'eventId': eventId }).exec(async (error) => {
            if (error) return // todo handle error

            ctx.deleteMessage()
            ctx.reply('Тренировка успешно удалена.\nИспользуйте команду /menu').then(() => ctx.scene.enter(Scene.schedule))

        })
    })
})

trainingEditScene.action(KeyboardAction.cancelDeleting, async (ctx: SceneContextMessageUpdate) => {
    ctx.scene.reenter()
})



export default trainingEditScene
