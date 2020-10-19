export module UserManager {

    export function isAdmin(userId?: string): boolean {
        return userId === '111326630' || userId === '180314551'
    }

}