import { SceneContextMessageUpdate } from "telegraf/typings/stage"


export abstract class SceneManager {

    // open scene and reset all previous stack
    public static open(ctx: SceneContextMessageUpdate, id: string, param?: object) {
        ctx.scene.enter(id, param)
        ctx.session.stack = Array<string>()
        ctx.session.currentSceneId = id
        // stack = []
    }

    // move to another scene with
    public static enter(ctx: SceneContextMessageUpdate, id: string, param?: object) {
        if (ctx.session.currentSceneId) {
            ctx.session.stack.push(ctx.session.currentSceneId)
        }
        
        ctx.session.currentSceneId = id
        ctx.scene.enter(id, param)
    } 

    public static back(ctx: SceneContextMessageUpdate, param?: object) {
        console.log(ctx.session)
        if (ctx.session.stack.length > 0) {
            const lastSceneId = ctx.session.stack.pop()!
            ctx.scene.enter(lastSceneId, param)
            // Stage.enter(lastSceneId, param)
            ctx.session.currentSceneId = lastSceneId
        }
        else
        {
            ctx.scene.enter(Scene.menu)
            console.error('Scene-navigation failed. stack length is zero')
        }
    }
}

export enum Scene {
    intro = 'intro',
    authorization = 'authorization',
    menu = 'menu',
    schedule = 'schedule',
    createEvent = 'create-event',
    discountSettings = 'discount-settings',
    trainingPage = 'training-page',
    trainingEdit = 'training-edit',
    userListPage = 'list-page',
    userTrainings = 'user-trainings',
    archiveScene = 'trainings-archive'
}