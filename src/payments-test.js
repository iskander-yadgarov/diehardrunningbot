const Telegraf = require('telegraf')
const Markup = require('telegraf/markup')

const invoice = {
  provider_token: '401643678:TEST:7426ec98-bf19-4a9d-84bd-94af19084cb7',
  start_parameter: 'time-machine-sku',
  title: 'Запись на тренировку',
  description: 'Только оплатив тренировку вы бронируете за собой место 🤗',
  currency: 'rub',
//   photo_url: 'https://vignette.wikia.nocookie.net/minecraft/images/2/2f/New_DiamondB.png/revision/latest/top-crop/width/300/height/300?cb=20190520094830',
//   is_flexible: true,
  prices: [
    { label: '1 Тренировка', amount: 80000 }
  ],
  payload: {
    coupon: 'DieHardCore'
  }
}

// const shippingOptions = [
//   {
//     id: 'unicorn',
//     title: 'Unicorn express',
//     prices: [{ label: 'Unicorn', amount: 20000 }]
//   },
//   {
//     id: 'slowpoke',
//     title: 'Slowpoke mail',
//     prices: [{ label: 'Slowpoke', amount: 20000 }]
//   }
// ]


const replyOptions = Markup.inlineKeyboard([
  [Markup.payButton('Заплатить 800,00 RUB')],
  [Markup.callbackButton('Отменить', 'back-action')]
]).extra()

const bot = new Telegraf('1133658830:AAGp7Ra5n5VwpwO4viRSyzfHjcr9MDyUSp8')
bot.start(({ replyWithInvoice }) => replyWithInvoice(invoice))
bot.command('buy', ({ replyWithInvoice }) => replyWithInvoice(invoice, replyOptions))
// bot.on('shipping_query', ({ answerShippingQuery }) => answerShippingQuery(true, shippingOptions))
bot.on('pre_checkout_query', ({ answerPreCheckoutQuery }) => answerPreCheckoutQuery(true))
bot.on('successful_payment', () => console.log('Woohoo'))
bot.launch()
