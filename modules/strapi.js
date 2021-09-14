import axios from "axios"

const host = process.env.STRAPI_HOST || "0.0.0.0"
const port = process.env.STRAPI_PORT || 1337

const url = `http://${host}:${port}`

const strapi = {}

strapi.get = async (type, filters) => {
    const {data} = await axios.get(`${url}/${type}`, {
        params: {
            ...filters,
            _limit: -1
        }
    })

    return data
}
strapi.getOne = async (type, id) => {
    const {data} = await axios.get(`${url}/${type}/${id}`)
    return data
}
strapi.create = async (type, data) => {
    await axios.post(`${url}/${type}`, data)
}
strapi.update = async (type, data) => {
    await axios.put(`${url}/${type}/${data.id}`, data)
}

strapi.count = async (type, filters) => {
    const {data} = await axios.get(`${url}/${type}/count`, {
       params: filters
    })
    return data
}

export default strapi