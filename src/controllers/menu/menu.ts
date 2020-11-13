import { BaseScene, Markup, Extra } from "telegraf"
import { SceneContextMessageUpdate } from "telegraf/typings/stage"
import EventSchema from "../../models/events/events.schema"
import { EventModel } from "../../models/events/events.model"
import strings from '../../resources/strings'
import { Scene } from '../scenes'
import { UserManager } from "../../managers/user"

const menuScene = new BaseScene(Scene.menu)

enum KeyboardAction {
    schedule = 'open_schedule',
    my_bookings = 'open_my_bookings',
    test = 'test-page',
    // admin's
    archive = 'open_archive',
    create_event = 'create_event',
    create_discount = 'create_discount'
}

const userBtns = [
    [Markup.callbackButton(strings.menu_scene.buttons.my_bookings, KeyboardAction.my_bookings),
    Markup.callbackButton(strings.menu_scene.buttons.schedule, KeyboardAction.schedule)],
    // [Markup.callbackButton('Page test', KeyboardAction.test)]
]

const adminBtns = [
    [Markup.callbackButton(strings.menu_scene.buttons.create_event, KeyboardAction.create_event),
    Markup.callbackButton(strings.menu_scene.buttons.archive, KeyboardAction.archive)]
    // Markup.callbackButton(strings.menu_scene.buttons.create_discount, KeyboardAction.create_discount)]
]

menuScene.enter((ctx: SceneContextMessageUpdate) => {
    console.log('enter in menu')
    if (ctx.chat == undefined) return
    let userId = ctx.chat.id.toString()

    let keyboards = userBtns
    if (UserManager.isAdmin(userId)) {
        keyboards = keyboards.concat(adminBtns)
    }
    const extra = Markup.inlineKeyboard(keyboards).extra()
    extra.parse_mode = "Markdown"

    if (ctx.updateType == 'message') {
        ctx.reply(strings.menu_scene.message, extra)
    } else {
        ctx.editMessageText(strings.menu_scene.message, extra)
    }
})


menuScene.action(KeyboardAction.schedule, (ctx: SceneContextMessageUpdate) => ctx.scene.enter(Scene.schedule))

menuScene.action(KeyboardAction.my_bookings, (ctx: SceneContextMessageUpdate) => ctx.scene.enter(Scene.userTrainings))

menuScene.action(KeyboardAction.archive, (ctx: SceneContextMessageUpdate) => ctx.scene.enter(Scene.archiveScene))

menuScene.action(KeyboardAction.create_event, (ctx: SceneContextMessageUpdate) => ctx.scene.enter(Scene.createEvent))

// menuScene.action(KeyboardAction.create_discount, (ctx: SceneContextMessageUpdate) => ctx.scene.enter(Scene.discountSettings))

export default menuScene
