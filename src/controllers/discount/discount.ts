import { BaseScene, Markup, Extra } from "telegraf"
import { SceneContextMessageUpdate } from "telegraf/typings/stage"
import strings from '../../resources/strings'
import { Scene } from '../scenes'
import { UserModel } from '../../models/users/users.model'
import { IUser, IUserDocument } from "../../models/users/users.types"
import { DiscountModel } from "../../models/discounts/discounts.model"
import UserSchema from "../../models/users/users.schema"

enum KeyboardAction {
    create_discount = 'create_discount',
    discount_list = 'discount_list',
    create_coupon = 'create_coupon',
    request_contact = 'request_contact',
    discount_confirm = 'discount_confirm',
    discount_cancel = 'discount_cancel',
    back_menu = 'back_to_menu'
}

enum DiscountRequested {
    none,
    user,
    amount
}

const keyboards = Markup.inlineKeyboard([
    [Markup.callbackButton('Изменить скидку', KeyboardAction.create_discount)],
    [Markup.callbackButton('Список всех скидок', KeyboardAction.discount_list)],
    [Markup.callbackButton('Создать купон', KeyboardAction.create_coupon)],
    [Markup.callbackButton('Назад', KeyboardAction.back_menu)]
])

const discountScene = new BaseScene(Scene.discountSettings)

// let state: DiscountRequested
// let userForDiscount: IUserDocument
// let discountAmount: number

discountScene.enter((ctx: SceneContextMessageUpdate) => {
    ctx.editMessageText('Здесь ты можешь привязать скидку к конкретному юзеру.', keyboards.extra())
    ctx.session.state = DiscountRequested.none
    ctx.session.userForDiscount = undefined
    ctx.session.discountAmount = undefined
})

discountScene.action(KeyboardAction.create_discount, async (ctx: SceneContextMessageUpdate) => {
    ctx.session.state = DiscountRequested.user
    ctx.reply('Отправь мне пользователя к которому хочешь привязать скидку.\n\nЭто можно сделать через опцию "Прикрепить" -> "Контакт"\n(важно: у тебя должен быть номер телефона пользователя ☝️)\n\nЛибо можешь просто отправить имя, я попробую его найти 🤓')
})

discountScene.on('text', (ctx: SceneContextMessageUpdate) => {

    const text = ctx.message?.text || undefined
    if (!text) return

    if (ctx.session.state == DiscountRequested.user) {
        const names = text.split(' ')
        console.log(names)
        UserModel.find({'firstName': names[0], 'lastName': names[1]}).exec( async(error, users) => {
            if (error) return // handle

            if (users.length == 0) { // not found
                ctx.reply('Мы не нашли никого по такому имени 😔')
            } else if (users.length > 1) { // found more than one
                ctx.reply('Мы нашли больше одного пользователя по такому имени, пожалуйста введи полное имя 🧐')
            } else { // exactly one
                let user = ctx.session.userForDiscount = users[0]
                const name = `${user.firstName} ${user.lastName}`
                if (user.discount > 0) {
                    const currentDiscount = user.discount.valueOf() * 100
                    ctx.reply(`${name} уже имеет скидку в ${currentDiscount}%. Введи новую скидку от 0 до 100%.`)
                } else {
                    ctx.reply(`Введи скидку для ${name}. От 0 до 100%.`)
                }
                ctx.session.state = DiscountRequested.amount
            }
        })
    } else if (ctx.session.state == DiscountRequested.amount) {
        const amount = Number.parseInt(text)
        if (isNaN(amount) || amount < 0 || amount > 100) {
            // not correct
            ctx.reply(`Скидка должна быть от 0 до 100%`)
        } else {
            ctx.session.discountAmount = amount
            const keyboards = Markup.inlineKeyboard([
                [Markup.callbackButton('Ой, затупил 🤦‍♂️', KeyboardAction.discount_cancel),
                Markup.callbackButton('Да, все так 👌', KeyboardAction.discount_confirm)]
            ]).extra()
            const name = `${ctx.session.userForDiscount.firstName} ${ctx.session.userForDiscount.lastName}`
            ctx.reply(`Так, давай все проверим. Ты хочешь выдать скидку для ${name} в размере ${amount}%?`, keyboards)
        }
    }
})

discountScene.on('contact', (ctx: SceneContextMessageUpdate) => {
    if (ctx.session.state != DiscountRequested.user) return

    const userId = ctx.message?.contact?.user_id
    console.log(ctx.message)
    if (userId == undefined) return

    UserModel.findOne({'chatId': userId.toString()}).exec(async (error, user) => {
        if (error) { console.log('error with UserModel.findOne: ' + userId) }  // handle

        if (user) {
            ctx.session.userForDiscount = user
            ctx.reply(`Введи скидку для ${user.firstName} ${user.lastName}. От 0 до 100%.`)
            ctx.session.state = DiscountRequested.amount
        } else {
            ctx.reply('Этого пользователя нет в нашей базе 😒')
        }
    })
})

discountScene.action(KeyboardAction.discount_confirm, async (ctx: SceneContextMessageUpdate) => {

    ctx.session.state = DiscountRequested.none
    ctx.session.userForDiscount.discount = ctx.session.discountAmount / 100
    const user = ctx.session.userForDiscount as IUserDocument
    user.updateOne(user).exec( async(error, user) => {
        if (error) return // todo handle error
        ctx.reply('Скидка успешно сохранена 😉')
    })
})

discountScene.action(KeyboardAction.discount_cancel, async (ctx: SceneContextMessageUpdate) => {
    ctx.session.state = DiscountRequested.none
    ctx.reply('Фух, я то уже думал 😬')
})

discountScene.action(KeyboardAction.discount_list, async (ctx: SceneContextMessageUpdate) => {

    UserModel.find({}).exec( async(error, users) => {
        if (error) return

        let list = ''
        let i = 0
        users.forEach(u => {
            if (u.discount > 0) list += `${++i}. ${u.firstName} ${u.lastName} –– ${u.discount.valueOf() * 100}%\n`
        })
        ctx.reply(list)
    })

})

discountScene.action(KeyboardAction.create_coupon, async (ctx: SceneContextMessageUpdate) => {

})

discountScene.action(KeyboardAction.back_menu, async (ctx: SceneContextMessageUpdate) => {
  ctx.scene.enter(Scene.menu)
})

export default discountScene
