"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Scene = exports.SceneManager = void 0;
class SceneManager {
    // open scene and reset all previous stack
    static open(ctx, id, param) {
        ctx.scene.enter(id, param);
        ctx.session.stack = Array();
        ctx.session.currentSceneId = id;
        // stack = []
    }
    // move to another scene with
    static enter(ctx, id, param) {
        if (ctx.session.currentSceneId) {
            ctx.session.stack.push(ctx.session.currentSceneId);
        }
        ctx.session.currentSceneId = id;
        ctx.scene.enter(id, param);
    }
    static back(ctx, param) {
        console.log(ctx.session);
        if (ctx.session.stack.length > 0) {
            const lastSceneId = ctx.session.stack.pop();
            ctx.scene.enter(lastSceneId, param);
            // Stage.enter(lastSceneId, param)
            ctx.session.currentSceneId = lastSceneId;
        }
        else {
            ctx.scene.enter(Scene.menu);
            console.error('Scene-navigation failed. stack length is zero');
        }
    }
}
exports.SceneManager = SceneManager;
var Scene;
(function (Scene) {
    Scene["intro"] = "intro";
    Scene["authorization"] = "authorization";
    Scene["menu"] = "menu";
    Scene["schedule"] = "schedule";
    Scene["createEvent"] = "create-event";
    Scene["discountSettings"] = "discount-settings";
    Scene["trainingPage"] = "training-page";
    Scene["trainingEdit"] = "training-edit";
    Scene["userListPage"] = "list-page";
    Scene["userTrainings"] = "user-trainings";
    Scene["archiveScene"] = "trainings-archive";
})(Scene = exports.Scene || (exports.Scene = {}));
//# sourceMappingURL=scenes.js.map