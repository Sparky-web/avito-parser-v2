import state from "./state.js"
import strapi from "./strapi.js"
import { Telegraf } from 'telegraf'

async function getState() {
    const bot = new Telegraf(process.env.BOT_TOKEN)

    bot.start(ctx => ctx.reply("Введите секретную фразу для получения уведомлений 😏"))
    bot.on("text", async ctx => {
        if(ctx.message.text === process.env.SECRET_PHRASE) {
            const [user] = await strapi.get("telegram-users", {chatId: ctx.message.chat.id})
            if(!user) await strapi.create("telegram-users", {
                chatId: ctx.message.chat.id
            })

            ctx.reply("Вы будете получать уведомления 😎")
        } else ctx.reply("Не верная секретная фраза 👊")
    })

    await bot.launch()
    return bot
}

async function sendMessage(chatId, message) {
    await state.telegram.telegram.sendMessage(chatId, message)
}

async function sendPhoto(userId, photoUrl, message) {
    await state.telegram.telegram.sendPhoto(userId, {url: photoUrl}, {caption: message})
}

async function sendPhotoToAllUsers(photoUrl, message) {
    const users = await strapi.get("telegram-users")

    for(let user of users) {
        await sendPhoto(user.chatId, photoUrl, message)
    }
}

const telegram = {
    getState,
    sendPhotoToAllUsers
}

export default telegram