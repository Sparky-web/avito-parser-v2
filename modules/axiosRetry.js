import axios from "axios"
import state from "./state.js"
import avito from "./avito.js";

function getAxiosInstance() {
    const request = axios.create()

    request.interceptors.request.use((config) => {
        if(config.url.match(/avito\.ru/ig)) config.headers.cookie = state.avito.cookie
        return config
    })
    request.interceptors.response.use(r => r, async function (e) {
        if(e.config.retriesCount >= state.config.maxRetriesCount) throw e

        if(e.response.config.url.match(/avito\.ru/ig) && e.response.status > 400) {
            state.avito.cookie = await avito.generateCookie()
            e.config.retriesCount = e.config.retriesCount ? e.config.retriesCount + 1 : 1
            return await request(e.config)
        }

        throw e
    })

    return request
}

export default {
    axios: getAxiosInstance(),
}

