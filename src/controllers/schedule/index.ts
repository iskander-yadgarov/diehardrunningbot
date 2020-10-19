import { BaseScene, Markup, Extra } from "telegraf"
import { SceneContextMessageUpdate } from "telegraf/typings/stage"
import { EventModel } from "../../models/events/events.model"
import strings from '../../resources/strings'
import { Scene, SceneManager } from '../scenes'
import { CallbackButton } from "telegraf/typings/markup"

enum KeyboardAction {
    back = 'back_action',
    openTraining = 'open_training-',
}

const scheduleScene = new BaseScene(Scene.schedule)

const backKeyboard = [Markup.callbackButton(strings.general.back, KeyboardAction.back, false)]

scheduleScene.enter((ctx: SceneContextMessageUpdate) => {
    // await ctx.editMessageText(strings.start_scene.message, keyboard.extra())
    buildSchedule(ctx)
})

// startScene.action(KeyboardAction.showTrainingSchedule, (ctx: SceneContextMessageUpdate) => {
function buildSchedule(ctx: SceneContextMessageUpdate) {
    // todo find only for today and after: { 'date': {$gte: start, $lt: until} }
    EventModel.find({'date': {$gte: new Date(), $lt: new Date().addDays(7)}}).sort('date').exec(async (error, events) => {
        if (error) { console.log(`error for fetching events: ${error}`); return }

        let dynamicButtons:CallbackButton[][] = []
        let row: CallbackButton[] = [];
        let maxCellPerRow = 5

        for (let i = 0; i < events.length; i++) {
            let e = events[i]

            // make a button
            let btn = Markup.callbackButton(e.date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }), KeyboardAction.openTraining + e._id, false)
            row.push(btn)

            // if the last one OR the next event's day is not the same 
            if (i == events.length - 1 || !e.date.isSameDate(events[i + 1].date)) {
                // end a row
                let seperatorTitle = [Markup.callbackButton('👇 ' + e.date.getStringFullDate() + ' 👇', 'null', false)]
                dynamicButtons.push(seperatorTitle)

                // make layout if greater than maximum
                let cellAmount = row.length
                if (cellAmount > maxCellPerRow) {
                    let rowAmount = Math.ceil(cellAmount / maxCellPerRow)
                    let perRow = Math.ceil(cellAmount / rowAmount)

                    for (let x = 0; x < rowAmount; x++) {
                        let newRow = row.slice(x * perRow, (x != rowAmount - 1) ? (x * perRow) + perRow : row.length)
                        dynamicButtons.push(newRow)
                    }
                } else {
                    dynamicButtons.push(row)
                }

                row = [] // clean a row
            }
        }
        dynamicButtons.push(backKeyboard)
        let extra = Markup.inlineKeyboard(dynamicButtons).extra()
        extra.parse_mode = "MarkdownV2"
        ctx.editMessageText(`Наше расписание на ближайшие 7 дней:`, extra).catch(() => ctx.reply(`Наше расписание на ближайшие дни:`, extra))

        
    })
}

// [0-9]*$
scheduleScene.action(new RegExp(`^${KeyboardAction.openTraining}`), (ctx: SceneContextMessageUpdate) => {
    let data = ctx.callbackQuery?.data
    let id = data?.split('-')[1]

    EventModel.findOne({ '_id': id }).exec(async (error, event) => {
        if (error || !event || !ctx.chat) return // todo handle errors
        // console.log(event)
        // let chatId = ctx.chat.id.toString()

        // go to scene 'pageTraining'
        SceneManager.enter(ctx, Scene.trainingPage, (event as any)._doc)
    })
})

scheduleScene.action(KeyboardAction.back, (ctx: SceneContextMessageUpdate) => {
    SceneManager.back(ctx)
})

/*
EventModel.find({}).sort('date').exec(async (error, events) => {
    if (error) { console.log(`error for fetching events: ${error}`); return }

    console.log(events)
    // show to user
    let dynamicButtons = [];
    let row: CallbackButton[] = [];
    let rowLength = 0;
    let previousDate = null

    for (let i = 0; i < events.length; i++) {
        let e = events[i];
        // let humanReadableDate = `${e.date.toLocaleTimeString()} ${e.date.toLocaleDateString()}`
        // e.date.getStringDay().toString()

        if (previousDate != null && !e.date.isSameDate(previousDate) ) {
            // send already filled row

            let seperatorTitle = [Markup.callbackButton((previousDate as Date).getStringDate().toString(), 'null', false)]
            
            dynamicButtons.push(seperatorTitle)
            dynamicButtons.push(row)
            
            // ctx.reply(`Тренировки на ${(previousDate as Date).getStringDate() }:`, Markup.inlineKeyboard([row]).extra())
            // dynamicButtons = [];
            row = []

        }
 
        previousDate = e.date
        let btn = Markup.callbackButton(e.date.toLocaleTimeString('en-GB', {hour: '2-digit', minute:'2-digit'}), KeyboardAction.bookTraining + i.toString(), false)
        row.push(btn)
        // rowLength++

        // if (rowLength == 3)
        // {
            // dynamicButtons.push(row);
            // row = []
            // rowLength = 0
        // }
    }

    let seperatorTitle = [Markup.callbackButton((previousDate as Date).getStringDate().toString(), 'null', false)]
            
    dynamicButtons.push(seperatorTitle)
    dynamicButtons.push(row)

    ctx.reply(`Вот наше расписание:`, Markup.inlineKeyboard(dynamicButtons).extra())
})
*/

// show calendar
/*
let daysToShow = 7
let dayButtons: Array<CallbackButton[]> = [];
let date = new Date()

for (let i = 0; i < daysToShow; i++) {
    let btn = [Markup.callbackButton(date.getStringDate().toString(), KeyboardAction.showTrainingForDay + i.toString(), false)]
    dayButtons.push(btn)
    date.addDays(1)
}

ctx.editMessageText('Выберите день', Markup.inlineKeyboard(dayButtons).extra())
*/


/*
startScene.action(/^show_training-[0-9]*$/, (ctx: SceneContextMessageUpdate) => {
    
    // check
    if (ctx.callbackQuery == undefined) return

    // get day what we are looking
    let data = ctx.callbackQuery.data!
    let index = parseInt(data.split('-')[1])
    
    let date = new Date()
    date = date.addDays(index)
    
    let start = new Date(date.getFullYear(),date.getMonth(),date.getDate(),1,0,0);
    let end = new Date(date.getFullYear(),date.getMonth(),date.getDate()+1,0,59,59);

    // make query
    let query = { 'date': {$gte: start, $lt: end} };

    // load trainings in day
    EventModel.find(query).exec(async (error, events) => {
        if (error) { console.log(`error for fetching events from ${start} to ${end}: ${error}`); return }
        console.log(events)

        // show to user
        let dynamicButtons = [];
        for (let i = 0; i < events.length; i++) {
            let e = events[i];
            let btn = [Markup.callbackButton(`${e.name} на ${e.address} в ${e.date.toLocaleTimeString()}`, KeyboardAction.bookTraining + i.toString(), false)]
            dynamicButtons.push(btn);
        }
        dynamicButtons.push([Markup.callbackButton(strings.start_scene.buttons.back, KeyboardAction.showTrainingSchedule, false)])

        ctx.editMessageText(`Вот доступные тренировки на ${date.toLocaleDateString()}:`, Markup.inlineKeyboard(dynamicButtons).extra())
    })
    
})
*/



export default scheduleScene
