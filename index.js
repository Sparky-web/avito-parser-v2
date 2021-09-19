import strapi from "strapi"
import avito from "./modules/avito.js"
import state from "./modules/state.js";
import _strapi from "./modules/strapi.js"
import telegram from "./modules/telegram.js";

import dotenv from "dotenv"

dotenv.config()

await strapi({dir: "./dashboard"}).start()
state.telegram = await telegram.getState()
state.avito = await avito.getState()

const start = async () => {
    try {
        const links = await _strapi.get("links", {isEnabled: true})
        for (let link of links) {
            const data = await avito.getItemsFromSearch(link)
            console.log(data.length)
        }

        await update()
    } catch (e) {
        console.error(e.message || e)
    }
}
const update = async () => {
    try {
        await avito.updateSold()
        await avito.updateAveragePrices()
    } catch(e) {
        console.error(e.message || e)
    }
}

await start()
await update()

setInterval(update, 1000 * 60 * 30)




