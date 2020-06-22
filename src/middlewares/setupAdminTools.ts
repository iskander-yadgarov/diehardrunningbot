import { Context } from "telegraf"
import { UserModel } from "../models/users/users.model"
import { UserManager } from "../managers/user"

enum AdminCommand {
    create = 'create'
}

export function setupAdminTools(ctx: Context, next: Function) {

    if (UserManager.isAdmin(ctx.chat?.id.toString())) {
        ctx.telegram.setMyCommands([{command: AdminCommand.create, description: 'создать новую запись на тренировку'}])
    }

    return next()
}