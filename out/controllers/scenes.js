"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Scene = void 0;
/*
export abstract class SceneManager {

    // open scene and reset all previous stack
    public static open(ctx: SceneContextMessageUpdate, id: string, param?: object) {
        ctx.session.stack = Array<string>()
        ctx.session.currentSceneId = id
        ctx.scene.enter(id, param)
        // stack = []
    }

    // move to another scene with
    public static enter(ctx: SceneContextMessageUpdate, id: string, param?: object) {
        if (ctx.session.currentSceneId) {
            ctx.session.stack.push(ctx.session.currentSceneId)
        }

        ctx.session.currentSceneId = id
        console.log(ctx.session)
        ctx.scene.enter(id, param)
        ctx.session.__scenes.current = id
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
*/
var Scene;
(function (Scene) {
    Scene["intro"] = "intro";
    Scene["menu"] = "menu";
    Scene["schedule"] = "schedule";
    Scene["createEvent"] = "create-event";
    Scene["citySelector"] = "city";
    Scene["trainingPage"] = "training-page";
    Scene["trainingEdit"] = "training-edit";
    Scene["userListPage"] = "list-page";
    Scene["userTrainings"] = "user-trainings";
    Scene["archiveScene"] = "trainings-archive";
})(Scene = exports.Scene || (exports.Scene = {}));
//# sourceMappingURL=scenes.js.map