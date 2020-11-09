import { BaseScene, Markup, Extra, Context } from "telegraf"
import { SceneContextMessageUpdate } from "telegraf/typings/stage"
import strings from '../../resources/strings'
import { Scene } from '../scenes'
import { IEvent } from "../../models/events/events.types"
import { EventModel } from "../../models/events/events.model"


enum Request {
    none = 'none',
    date = 'date',
    name = 'name',
    location = 'location',
    price = 'price',
    capacity = 'capacity'
}

enum KeyboardAction {
    cancel = 'cancel',
    publish = 'publish',
    retry = 'retry',
    menu = 'menu'
}

const createEventScene = new BaseScene(Scene.createEvent)

const keyboardPlain = Markup.inlineKeyboard([
    [Markup.callbackButton('Отменить', KeyboardAction.cancel)]
])

const keyboardCompleted = Markup.inlineKeyboard([
    [Markup.callbackButton('Отменить', KeyboardAction.cancel),
    Markup.callbackButton('Опубликовать', KeyboardAction.publish)]
])

const postKeyboard = Markup.inlineKeyboard([
    [Markup.callbackButton('Создать еще', KeyboardAction.retry)],
    [Markup.callbackButton('Меню', KeyboardAction.menu)]
])

createEventScene.enter(async (ctx: SceneContextMessageUpdate) => {
    const nextRequest = nextRequestFor(undefined)

    ctx.scene.state.createEventState = nextRequest
    ctx.scene.state.rawEvent = {}

    if (ctx.updateType == 'callback_query') {
        ctx.deleteMessage()
    }

    ctx.scene.state.lastMessageText = eventDescription(undefined) + '\n' + requestDescription(nextRequest)
    ctx.scene.state.lastMessageId = (await ctx.reply(ctx.scene.state.lastMessageText, keyboardPlain.extra())).message_id
})

// createEventScene.leave((ctx: SceneContextMessageUpdate) => {
    // ctx.scene.state.createEventState = {}
// })

createEventScene.action(KeyboardAction.cancel, (ctx: SceneContextMessageUpdate) => {
    // ctx.scene.state.createEventState = undefined
    // ctx.scene.state.rawEvent = undefined
    ctx.scene.enter(Scene.schedule)
})

createEventScene.action(KeyboardAction.retry, (ctx: SceneContextMessageUpdate) => {
    ctx.scene.reenter()
})

createEventScene.action(KeyboardAction.menu, (ctx: SceneContextMessageUpdate) => {
    ctx.scene.enter(Scene.schedule)
})

createEventScene.action(KeyboardAction.publish, async (ctx: SceneContextMessageUpdate) => {
    // publish training
    // get event from context
    let event = ctx.scene.state.rawEvent as IEvent
    // todo check if valid
    EventModel.create(event).then(_ => {
        ctx.editMessageText(`Отлично, событие опубликовано 👍`, postKeyboard.extra())
    })
})

createEventScene.on('text', async (ctx: SceneContextMessageUpdate, next: Function) => {
    const text = ctx.message?.text || '/'
    const state = ctx.scene.state.createEventState as Request

    if (text[0] == '/') return

    let event = ctx.scene.state.rawEvent as IEvent
    let message = ''

    switch (state) {
        case Request.date: {
            const date = text.splitByTimeAndDate() //splitByTimeAndDate(text)

            if (date == undefined || !date.isValid()) {
                message = 'Неверный формат данных'
            } else {
                const localizedDate = `${date.getStringFullDate()}, ${date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}`
                if (date < new Date()) {
                    message = `Нельзя указывать прошедшую дату.\nВы указали: ${localizedDate}`
                } else {
                    event.date = date
                    const nextRequest = nextRequestFor(event)
                    ctx.scene.state.createEventState = nextRequest
                    message = eventDescription(event) + '\n' + requestDescription(nextRequest)
                }
            }
            break
        }
        case Request.name: {
            event.name = text
            const nextRequest = nextRequestFor(event)
            ctx.scene.state.createEventState = nextRequest
            message = eventDescription(event) + '\n' + requestDescription(nextRequest)
            break
        }
        case Request.location: {
            event.address = text
            const nextRequest = nextRequestFor(event)
            ctx.scene.state.createEventState = nextRequest
            message = eventDescription(event) + '\n' + requestDescription(nextRequest)
            break
        }
        case Request.price: {
            const price = Number.parseFloat(text)
            if (isNaN(price) || price < 0) {
                message = `Неверный формат. Цена должна быть числом, больше или равно нулю.\nВы указали: ${text}`
            } else {
                event.price = price
                const nextRequest = nextRequestFor(event)
                ctx.scene.state.createEventState = nextRequest
                message = eventDescription(event) + '\n' + requestDescription(nextRequest)
            }
            break
        }
        case Request.capacity: {
            const capacity = Number.parseInt(text)
            if (isNaN(capacity) || capacity <= 0) {
                message = `Неверный формат. Кол-во должно быть числом больше нуля.\nВы указали: ${text}`
            } else {
                event.capacity = capacity
                const nextRequest = nextRequestFor(event)
                ctx.scene.state.createEventState = nextRequest
                message = eventDescription(event) + '\n' + requestDescription(nextRequest)
            }
            break
        }
        case Request.none: {
            message = eventDescription(event) + '\n' + requestDescription(state)
            break
        }
        default:
            return
    }

    // remove inline keyboards from previous message
    // ctx.telegram.editMessageText(ctx.chat!.id, ctx.scene.state.lastMessageId, undefined, ctx.scene.state.lastMessageText)

    // ctx.scene.state.lastMessageText = message
    // ctx.scene.state.lastMessageId = (await
    ctx.reply(message, ctx.scene.state.createEventState == Request.none ? keyboardCompleted.extra() : keyboardPlain.extra())

    ctx.scene.state.rawEvent = event
    return next()
})

function eventDescription(event: IEvent | undefined): string {
    if (event === undefined) {
        return '🔥 Новое событие 🔥\n'
    }

    let description = ''

    if (event.name !== undefined && event.name.length > 0) {
        description += `Событие: ${event.name}\n`
    }

    if (event.date !== undefined) {
        const localizedDate = `${event.date.getStringFullDate()}, ${event.date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}`
        description += `Дата: ${localizedDate}\n`
    }

    if (event.address !== undefined && event.address.length > 0) {
        description += `Локация: ${event.address}\n`
    }

    if (event.price !== undefined) {
        description += `Стоимость: ${event.price} ₽\n`
    }

    if (event.capacity !== undefined) {
        description += `Кол-во мест: ${event.capacity}`
    }

    return description
}

function requestDescription(request: Request): string {
    switch (request) {
        case Request.name:
            return 'Введите имя события:'
        case Request.date:
            return 'Введите дату (формат HH:MM DD MM):'
        case Request.location:
            return 'Введите локацию:'
        case Request.price:
            return 'Введите стоимость (₽):'
        case Request.capacity:
            return 'Введите кол-во мест:'
        case Request.none:
            return 'Событие готово к публикации'
    }
}

function nextRequestFor(event: IEvent | undefined): Request {
    if (event == undefined || event.date === undefined) {
        return Request.date
    } else if (event.name === undefined || event.name == '') {
        return Request.name
    } else if (event.address === undefined) {
        return Request.location
    } else if (event.price === undefined) {
        return Request.price
    } else if (event.capacity === undefined) {
        return Request.capacity
    } else {
        return Request.none
    }
}

export default createEventScene
