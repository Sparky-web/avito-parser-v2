import axios from "axios"
import url from "./url.js"
import _ from "lodash"
import strapi from "./strapi.js";
import randomUseragent from "random-useragent"
import axiosRetry from "./axiosRetry.js";
import telegram from "./telegram.js";

const generateCookie = async () => {
    const f = `5.c3837d09028233105a26f3839ed5da0718acb09177f426d418acb09177f426d418acb09177f426d418acb09177f426d4eb41a574e646f5d6eb41a574e646f5d6eb41a574e646f5d633cf7be726e5a5d933cf7be726e5a5d9724cdfdb5d74c73c0df103df0c26013a8b1472fe2f9ba6b90df103df0c26013a0df103df0c26013adc5322845a0cba1a3dad307ec010882759d93c1352fb82c6742d70caf8d4c5a878ba5f931b08c66ada461aa06e9af9d53c02ea8f64acc0bd8b1472fe2f9ba6b92da10fb74cac1eabf722fe85c94f7d0c268a7bf63aa148d2f722fe85c94f7d0c2da10fb74cac1eab2da10fb74cac1eabf0c77052689da50d268a7bf63aa148d2f722fe85c94f7d0c7705f11cf96b30b242f72d0457dff95a129a7f9add5eb3c469b09b0547bae2c11b8894b7dccb529c1da9f488c469f0756f6246f7eaf3b77bd3f41bd13d9c4fbb2af9e5c04fd1603f6124759e2802d755ebde705e4a5178720df103df0c26013a0df103df0c26013aafbc9dcfc006bed954343acdca9a7c70974fbbae88acc1923de19da9ed218fe23de19da9ed218fe2d6fdecb021a45a311d31352e4819a10992bff18307225f49`
    const s = `b0b332a8882daa94368a9295e81188540409a7ad934a19a9a76e4ea3b9eb07ab130bf463c029e65838d87f87654b1f0197b54abb2c85c3368a266a48f493f36baaef394eaf0bf27eac5968ef4d77f0f20415d1a639ecf644`

    const reqBody = `--41866489867864987
Content-Disposition: form-data; name="f"

${f}
--41866489867864987
Content-Disposition: form-data; name="s"

${s}
--41866489867864987--
`
    const {data} = await axios.post("https://m.avito.ru/web/2/ft", reqBody, {
        headers: {
            "content-type": `multipart/form-data;boundary="41866489867864987"`,
            "user-agent": randomUseragent.getRandom()
        }
    })

    return `ft=${data}; f=${f}`
}

const getItem = async (id, options = {raw: false}) => {
    const {data} = await axiosRetry.axios
        .get(`https://m.avito.ru/api/17/items/${id}?key=af0deccbgcgidddjgnvljitntccdduijhdinfgjgfjir&action=view`)
        .catch(err => {
            if (err.response.status === 404) return {
                data: {
                    status: "closed"
                }
            }
            else throw err
        })

    return options.raw ? data : serializeItem(data)
}

const getItemsFromSearch = async (link) => {
    const mobileUrl = url.toMobileUrl(link.url)

    const itemsIds = []
    const {data: html} = await axios.get(mobileUrl, {params: {s: 104}})
    const initialData = JSON.parse(decodeURIComponent(html.match(/(?<=initialData__ = ")(.*)(?=")/g)?.[0]))

    const searchParams = initialData.search.searchParams
    const allCount = initialData.search.count

    const params = {
        ...searchParams,
        'key': 'af0deccbgcgidddjgnvljitntccdduijhdinfgjgfjir',
        'limit': '50',
        'sort': 'date'
    }

    for (let i = 1; i < ((allCount + 50) / 50); i++) {
        try {
            const {data: {result: {items}}} = await axiosRetry.axios.get("https://m.avito.ru/api/11/items", {
                params: {
                    ...params,
                    page: i
                }
            })
            const ids = items.filter(e => e.type === "item").map(e => e.value.id)
            itemsIds.push(...ids)
        } catch (e) {
            console.log(e.response?.data || e)
        }
    }

    let allItems = []
    const itemsChunks = _.chunk(itemsIds, 20)
    for (let items of itemsChunks) {
        await Promise.all(items.map(async item => {
            try {
                allItems.push(await getItem(item))
            } catch (e) {
                console.log(e.message)
            }
        }))
    }

    allItems = allItems.filter(el => {
        if(el.isSold) return false

        let a = el.title?.match?.(new RegExp(link.query, "ig"))
        let b = !el.title?.match?.(new RegExp(link.titleExclude, "ig"))
        let c = !el.description?.match?.(new RegExp(link.descriptionExclude, "ig"))

        return a && b && c && el.isUserActive
    })

    let added
    if (link.shouldAddToDb) {
        added = (await writeNewItems(allItems, link))
    }
    if (link.shouldNotify) await sendNotifications(added, link)
    if (link.isFirstParse) link.isFirstParse = false

    const last = link.lastParse[link.lastParse.length - 1]
    if (!last || (new Date() - new Date(_.last(link.lastParse).time)) > 1000 * 60 * 60 * 5)
        link.lastParse.push({
            amountParsed: allItems.length,
            amountAdded: added.length,
            amount: await strapi.count("items", {link: link.id}),
            time: new Date().toISOString()
        })
    else link.lastParse[link.lastParse.length - 1] = {
        ...last,
        amountParsed: allItems.length,
        amountAdded: _.last(link.lastParse).amountAdded + added.length,
        amount: await strapi.count("items", {link: link.id}),
    }

    await strapi.update("links", link)
    return allItems
}

const getState = async () => {
    return {
        cookie: await generateCookie()
    }
}

const writeNewItems = async (items, link) => {
    const oldOffers = await strapi.get("items")

    const oldUIds = _.map(oldOffers, "uId")
    const uIds = _.map(items, "uId")

    const newUIds = _.difference(uIds, oldUIds)
    const newItems = newUIds.map(uId => ({
        ..._.find(items, {uId}),
        link: link.id
    }))

    for (let item of newItems) {
        await strapi.create("items", item)
    }

    return newItems
}

const serializeItem = item => ({
    title: item.title,
    description: item.description,
    price: +item.firebaseParams?.itemPrice,
    photoUrls: item.images?.map(el => {
        const urls = Object.values(el)
        return urls[urls.length - 1]
    }).join(","),
    datePublished: new Date(item.time * 1000),
    dateSold: null,
    isSold: item.status === "closed",
    address: item.address,
    isUserActive: !!item.seller?.replyTime?.text,
    uId: item.id,
    url: item?.seo?.canonicalUrl
})

const updateSold = async () => {
    const items = await strapi.get("items", {isSold: false})
    const chunks = _.chunk(items, 20)
    for (let chunk of chunks) {
        await Promise.all(chunk.map(async item => {
            const newItem = await getItem(item.uId)
            if (newItem.isSold) {
                console.log(`SOLD ITEM! ${item.url}`)
                await strapi.update("items", {
                    id: item.id,
                    isSold: true,
                    dateSold: new Date()
                })
            }
        }))
    }
}

const getAveragePrice = async (link) => {
    const notSold = await strapi.get("items", {
        link: link.id,
        isSold: false
    })
    const sold = await strapi.get("items", {
        link: link.id,
        isSold: true
    })

    return {
        averagePrice: Math.round(notSold.map(e=>e.price).reduce((acc, val) => acc + val, 0) / notSold.length),
        averageSoldPrice: Math.round(sold.map(e=>e.price).reduce((acc, val) => acc + val, 0) / sold.length)
    }
}

const updateAveragePrices = async () => {
    const links = await strapi.get("links")
    for(let link of links) {
        await strapi.update("links", {
            ...link,
            ...await getAveragePrice(link)
        })
    }
}

const sendNotifications = async (items, link) => {
    const belowAverage = items.filter(item => item.price < link.averageSoldPrice)
    for(let item of belowAverage) {
        await sendItem(item, link)
    }
}

const sendItem = async (item, link) => {
    const text = `
${item.title} - ${item.price} ₽
Ниже среднеей цены на ${link.averageSoldPrice - item.price} ₽

${item.description}
${item.url}
`
    const photoUrl = item.photoUrls.split(",")[0]

    await telegram.sendPhotoToAllUsers(photoUrl, text)
}

const avito = {
    getItem,
    getItemsFromSearch,
    generateCookie,
    getState,
    updateSold,
    getAveragePrice,
    updateAveragePrices
}

export default avito




