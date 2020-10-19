import { BaseScene, Markup, Extra, Context } from "telegraf"
import { SceneContextMessageUpdate } from "telegraf/typings/stage"
import strings from '../../resources/strings'
import { Scene, SceneManager } from '../scenes'
import { num } from "envalid"
import { IEvent } from "../../models/events/events.types"
import { EventModel } from "../../models/events/events.model"
import asyncWrapper from "../../utils/errorHandler"
import e from "express"

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
    [Markup.callbackButton('Главное меню', KeyboardAction.menu)]
])

createEventScene.enter(async (ctx: SceneContextMessageUpdate) => {
    const nextRequest = nextRequestFor(undefined)

    ctx.session.createEventState = nextRequest
    ctx.session.rawEvent = {}

    if (ctx.updateType == 'callback_query') {
        ctx.deleteMessage()
    }

    ctx.session.lastMessageText = eventDescription(undefined) + '\n' + requestDescription(nextRequest)
    ctx.session.lastMessageId = (await ctx.reply(ctx.session.lastMessageText, keyboardPlain.extra())).message_id
})

createEventScene.leave((ctx: SceneContextMessageUpdate) => {
    ctx.session.createEventState = {}
})

createEventScene.action(KeyboardAction.cancel, (ctx: SceneContextMessageUpdate) => {
    ctx.session.createEventState = undefined
    ctx.session.rawEvent = undefined
    SceneManager.open(ctx, Scene.intro)
    // ctx.editMessageText('Создание отменено.', postKeyboard.extra())
})

createEventScene.action(KeyboardAction.retry, (ctx: SceneContextMessageUpdate) => {
    ctx.scene.reenter()
})

createEventScene.action(KeyboardAction.menu, (ctx: SceneContextMessageUpdate) => {
    SceneManager.open(ctx, Scene.intro)
})

createEventScene.action(KeyboardAction.publish, async (ctx: SceneContextMessageUpdate) => {
    // publish training
    // get event from context
    let event = ctx.session.rawEvent as IEvent
    // todo check if valid
    EventModel.create(event).then(_ => {
        ctx.editMessageText(`Отлично, событие опубликовано 👍`, postKeyboard.extra())
    })
})

createEventScene.on('text', async (ctx: SceneContextMessageUpdate, next: Function) => {
    const text = ctx.message?.text || '/'
    const state = ctx.session.createEventState as Request
    
    if (text[0] == '/') return

    let event = ctx.session.rawEvent as IEvent
    let message = ''

    switch (state) {
        case Request.date: {
            const date = text.splitByTimeAndDate() //splitByTimeAndDate(text)
            
            if (date == undefined) { 
                message = 'Неверный формат данных'
            } else {
                const localizedDate = `${date.getStringFullDate()}, ${date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`
                if (date < new Date()) {
                    message = `Нельзя указывать прошедшую дату.\nВы указали: ${localizedDate}`
                } else {
                    event.date = date
                    const nextRequest = nextRequestFor(event)
                    ctx.session.createEventState = nextRequest
                    message = eventDescription(event) + '\n' + requestDescription(nextRequest)
                }
            }
            break
        }
        case Request.name: {
            event.name = text
            const nextRequest = nextRequestFor(event)
            ctx.session.createEventState = nextRequest
            message = eventDescription(event) + '\n' + requestDescription(nextRequest)
            break
        }
        case Request.location: {
            event.address = text
            const nextRequest = nextRequestFor(event)
            ctx.session.createEventState = nextRequest
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
                ctx.session.createEventState = nextRequest
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
                ctx.session.createEventState = nextRequest
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
    ctx.telegram.editMessageText(ctx.chat!.id, ctx.session.lastMessageId, undefined, ctx.session.lastMessageText)

    ctx.session.lastMessageText = message
    ctx.session.lastMessageId = (await ctx.reply(message, ctx.session.createEventState == Request.none ? keyboardCompleted.extra() : keyboardPlain.extra())).message_id

    ctx.session.rawEvent = event
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
        const localizedDate = `${event.date.getStringFullDate()}, ${event.date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`
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