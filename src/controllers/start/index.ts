import { BaseScene, Markup, Extra } from "telegraf"
import { SceneContextMessageUpdate } from "telegraf/typings/stage"
import strings from '../../resources/strings'
import Scene from '../scenes'

enum KeyboardAction {
    showTrainingSchedule = 'show_training_schedule',
    showSettings = 'show_settings'
}

const startScene = new BaseScene(Scene.start)

const keyboard = Markup.inlineKeyboard([
    [Markup.callbackButton(strings.start_scene.buttons.training_schedule, KeyboardAction.showTrainingSchedule, false)],
    [Markup.callbackButton(strings.start_scene.buttons.settings, KeyboardAction.showSettings, false)]
])

startScene.enter(async (ctx: SceneContextMessageUpdate) => {
    await ctx.editMessageText(strings.start_scene.message, keyboard.extra())
})

export default startScene