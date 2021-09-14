import strapi from "strapi"
import avito from "./modules/avito.js"
import state from "./modules/state.js";
import _strapi from "./modules/strapi.js"

import dotenv from "dotenv"

dotenv.config()

await strapi({dir: "./dashboard"}).start()
state.avito = await avito.getState()

setInterval(async () => {
    try {
        const links = await _strapi.get("links", {isEnabled: true})
        for (let link of links) {
            const data = await avito.getItemsFromSearch(link)
            console.log(data.map(e => e.title))
        }
        await avito.updateSold()
    } catch (e) {
        console.error(e.message || e)
    }
}, 1000 * 60 * 60 * 30)




