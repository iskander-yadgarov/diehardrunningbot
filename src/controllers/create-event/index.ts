import { BaseScene, Markup, Extra, Context } from "telegraf"
import { SceneContextMessageUpdate } from "telegraf/typings/stage"
import strings from '../../resources/strings'
import Scene from '../scenes'

enum State {
    date,
    time,
    location,
    name
}

let state: State
const createEventScene = new BaseScene(Scene.createEvent)

createEventScene.enter(async (ctx: SceneContextMessageUpdate) => {
    state = State.date
    ctx.reply(strings.create_event.when)
})

createEventScene.on('text', (ctx: SceneContextMessageUpdate) => {
    const text = ctx.message?.text || ''

    switch (state) {
        case State.date:
            let numbers = text.split(/[\s.]+/).map(Number)
            const now = new Date()

            if (numbers.length == 0) {
                console.log('error parsing date')
            } else if (numbers.length == 1) {
                numbers.push(now.getMonth() + 1)
                numbers.push(now.getFullYear())
            } else if (numbers.length == 2) {
                numbers.push(now.getFullYear())
            }

            const date = new Date(Date.UTC(numbers[2], numbers[1] - 1, numbers[0]))

            ctx.reply(date.toLocaleDateString())

            break
        case State.time:

            break 
        case State.location:
            break
        case State.name:
    }
})

export default createEventScene