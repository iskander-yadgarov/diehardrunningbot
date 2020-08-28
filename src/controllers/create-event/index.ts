import { BaseScene, Markup, Extra, Context } from "telegraf"
import { SceneContextMessageUpdate } from "telegraf/typings/stage"
import strings from '../../resources/strings'
import Scene from '../scenes'
import { num } from "envalid"
import { IEvent } from "../../models/events/events.types"
import asyncWrapper from "../../utils/errorHandler"

enum Request {
    none = 'none',
    date = 'date',
    name = 'name',
    location = 'location'
}

enum KeyboardAction {
    cancel = 'cancel',
    save = 'save',
    publish = 'publish'
}

const createEventScene = new BaseScene(Scene.createEvent)

const keyboard = Markup.inlineKeyboard([
    [Markup.callbackButton('Отменить', KeyboardAction.cancel, false)]
])

createEventScene.enter(async (ctx: SceneContextMessageUpdate) => {
    const nextRequest = nextRequestFor(undefined)

    ctx.session.createEventState = nextRequest
    ctx.session.rawEvent = {}

    ctx.reply(eventDescription(undefined) + '\n' + requestDescription(nextRequest))
})

createEventScene.leave(async (ctx: SceneContextMessageUpdate) => {
    console.log('leave create event')
    ctx.session.createEventState = {}
})

createEventScene.action(KeyboardAction.cancel, (ctx: SceneContextMessageUpdate) => {
    ctx.scene.leave()
})

createEventScene.on('text', (ctx: SceneContextMessageUpdate, next: Function) => {
    const text = ctx.message?.text || ''
    const state = ctx.session.createEventState as Request
    
    let event = ctx.session.rawEvent as IEvent
    let message = ''

    switch (state) {
        case Request.date: {
            const date = splitByTimeAndDate(text)
            
            if (date == undefined) { 
                // ctx.reply('Неверный формат данных')
                message = 'Неверный формат данных'
            } else {
                const humanReadableDate = `${date.toLocaleTimeString()} ${date.toLocaleDateString()}`
                
                if (date < new Date()) {
                    // ctx.reply(`Нельзя указывать прошедшую дату.\nВы указали: ${humanReadableDate}`)
                    message = `Нельзя указывать прошедшую дату.\nВы указали: ${humanReadableDate}`
                } else {
                    event.date = date
                    
                    const nextRequest = nextRequestFor(event)
                    // ctx.reply(eventDescription(event) + '\n' + requestDescription(nextRequest))
                    ctx.session.createEventState = nextRequest

                    message = eventDescription(event) + '\n' + requestDescription(nextRequest)
                }
            }

            break
        }
        case Request.name: {
            event.name = text

            const nextRequest = nextRequestFor(event)
            // ctx.reply(eventDescription(event) + '\n' + requestDescription(nextRequest))
            ctx.session.createEventState = nextRequest

            message = eventDescription(event) + '\n' + requestDescription(nextRequest)
            break
        }
        case Request.location: {
            event.address = text

            const nextRequest = nextRequestFor(event)
            // ctx.reply(eventDescription(event) + '\n' + requestDescription(nextRequest))
            ctx.session.createEventState = nextRequest
            message = eventDescription(event) + '\n' + requestDescription(nextRequest)
            
            break
        }
        case Request.none: {
            message = 'Ничего'
        }
    }

    ctx.reply(message, keyboard.extra())
    ctx.session.rawEvent = event

    return next()
})

/**
 * 
    Бот поддерживает время в формате:
    6      -> 06:00
    5 3    -> 05:03
    15:30  -> 15:30
    1530   -> 15:30

    Бот поддерживает дату в формате:
    6      -> 6 число текущего месяца
    9 6    -> 9 июня
    8 7 2017 -> 8 июля 2017 года

    * вместо пробелов между числами даты можно использовать точки

    Если вы введете только время, бот запланирует пост на тот день, который у вас выбран.
    Чтобы отложить пост на любой другой день введите время и дату.

    Например, 16 30 6 8 -> 16:30 6 августа
 */
function splitByTimeAndDate(text: string): Date | undefined {
    const elements = text.split(/[\s.]+/)

    if (elements.length == 0) { return undefined }

    const timeElements = splitTimeIfNeeded(elements[0])
    if (timeElements == undefined) { return undefined }

    const numbers = timeElements.concat(elements.slice(1)).map(Number)

    if (numbers.length == 0) { return undefined }

    const time = getTime(numbers.slice(0, 2))
    const date = getDate(numbers.slice(2))

    if (time == undefined || date == undefined) {
        return undefined
    } else {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate(), time.getHours(), time.getMinutes())
    }
}

function splitTimeIfNeeded(text: string): Array<string> | undefined {
    if (text.length > 2) {
        switch (text.length) {
            case 3: {
                return undefined
            }
            case 4: {
                return [text.slice(0, 2), text.slice(2)]
            }
            case 5: {
                if (text.includes(':')) {
                    return text.split(':')
                } else {
                    return undefined
                }
            }
            default: {
                return undefined
            }
        }
    } else {
        return [text]
    }
}

function getTime(numbers: Array<number>): Date | undefined {
    if (numbers.length == 0 || numbers.length > 2) { return undefined }

    let date = new Date()

    let hours = numbers[0]
    let minutes = numbers[1]
    if (minutes === undefined) { minutes = 0 }

    if (hours > 24) { return undefined }
    if (minutes > 60) { return undefined }

    date.setHours(hours)
    date.setMinutes(minutes)

    return date
}

function getDate(numbers: Array<number>): Date | undefined {
    let date = new Date()

    if (numbers.length == 0) { return date }
    if (numbers.length > 3) { return undefined }

    let day = numbers[0]
    let month = numbers[1]
    let year = numbers[2]

    if (month === undefined) { month = date.getMonth() + 1 }
    if (year === undefined) { year = date.getFullYear() }

    if (day > 31) { return undefined }
    if (month > 12) { return undefined }

    date.setFullYear(year, month - 1, day)

    return date
}

function eventDescription(event: IEvent | undefined): string {
    if (event === undefined) {
        return '🔥 Новое событие 🔥\n'
    }

    let description = ''

    if (event.name !== undefined && event.name.length > 0) {
        description += `Событие: ${event.name}\n`
    }

    if (event.date !== undefined) {
        const humanReadableDate = `${event.date.toLocaleTimeString()} ${event.date.toLocaleDateString()}`
        description += `Дата: ${humanReadableDate}\n`
    }

    if (event.address !== undefined && event.address.length > 0) {
        description += `Локация: ${event.address}\n`
    }

    return description
}

function requestDescription(request: Request): string {
    switch (request) {
        case Request.name: {
            return 'Введите имя события:'
        }
        case Request.date: {
            return 'Введите дату:'
        }
        case Request.location: {
            return 'Введите локацию:'
        }
        case Request.none: {
            return 'Событие готово к публикации'
        }
    }
}

function nextRequestFor(event: IEvent | undefined): Request {
    if (event == undefined) {
        return Request.date
    } else if (event.date === undefined) {
        return Request.date
    } else if (event.name === undefined || event.name == '') {
        return Request.name
    } else if (event.address === undefined) {
        return Request.location
    } else {
        return Request.none
    }
}

export default createEventScene