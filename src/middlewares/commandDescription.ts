import { Context } from "telegraf"
import { UserModel } from "../models/users/users.model"
import { UserManager } from "../managers/user"

export enum Commands {
    // admins
    create = 'create',

    // users
    menu = 'menu'
}

const adminCommands = [{command: Commands.create, description: 'создать новую запись на тренировку'}]
const userCommands = [{command: Commands.menu, description: 'перейти в главное меню'}]

export function setupCommandsDesctiption(ctx: Context, next: Function) {

    let commands = userCommands

    if (UserManager.isAdmin(ctx.chat?.id.toString())) {
        commands = commands.concat(adminCommands)
    }

    ctx.telegram.setMyCommands(commands)

    return next()
}