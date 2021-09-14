import {JSDOM} from "jsdom"

const getWindow = (html, options) => {
    return new JSDOM(html).window
}

const getDocument = (html, options) => {
    return new JSDOM(html).window.document
}

const dom = {
    getWindow,
    getDocument
}


export default dom