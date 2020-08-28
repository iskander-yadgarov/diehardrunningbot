import * as telegraf from 'telegraf'

declare module "telegraf" {
    export interface Context {
        state: any
        session: any
    }
}