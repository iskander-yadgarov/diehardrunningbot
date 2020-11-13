import { BaseScene, Markup, Extra } from "telegraf"
import { SceneContextMessageUpdate } from "telegraf/typings/stage"
import strings from '../../resources/strings'
import { Scene } from '../scenes'
import { UserModel } from '../../models/users/users.model'
import { IUser, IUserDocument } from "../../models/users/users.types"
import { CallbackButton } from "telegraf/typings/markup"
import { CityModel } from '../../models/city/city.model'

enum KeyboardAction {
    ready = 'ready',
    select = 'select-'
}

const citySelectorScene = new BaseScene(Scene.citySelector)


citySelectorScene.enter(async (ctx: SceneContextMessageUpdate) => {

    let promise = CityModel.find({}).exec()
    let cities = await promise
    if (!cities) return;

    ctx.scene.state.cities = cities
    let buttons: CallbackButton[][] = [];
    for (let i = 0; i < cities.length; i++) {
        var button = [Markup.callbackButton(cities[i].name.toString(), KeyboardAction.select + i)]
        buttons.push(button)
    };
    ctx.reply(`Выбери город:`, Markup.inlineKeyboard(buttons).extra())
})

citySelectorScene.action(new RegExp(`^${KeyboardAction.select}`), async (ctx: SceneContextMessageUpdate) => {
    let data = ctx.callbackQuery?.data
    if (!data) return
    let id = parseInt(data.split('-')[1])
    console.log(ctx.scene.state)
    ctx.session.selectedCity = ctx.scene.state.cities[id]
    ctx.scene.enter(Scene.schedule)
})

export default citySelectorScene