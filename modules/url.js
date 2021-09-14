import {URL} from "url"

const toMobileUrl = url => {
    const parsed = new URL(url)
    if (parsed.host.match(/^m\..*$/ig)) return url
    else if (parsed.host.match(/^www\..*$/ig))
        return `${parsed.protocol}//${parsed.host.replace(/www\./ig, "m.")}${parsed.pathname}${parsed.search}`
    else return `${parsed.protocol}//m.${parsed.host}${parsed.pathname}${parsed.search}`
}

const url = {
    toMobileUrl
}

export default url
