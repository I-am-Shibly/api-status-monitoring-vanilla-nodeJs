const url = require('url')
const { StringDecoder } = require('string_decoder')
const routes = require('../routes')
const { notFoundHandler } = require('../handlers/routeHandlers/notFoundHandler')
const {parseJSON} = require('../helpers/utilities')
const handler = {}

handler.handleReqRes = (req, res) => {
    // get the url and parse it
    const parsedURL = url.parse(req.url, true)
    const path = parsedURL.pathname
    const trimmedPath = path.replace(/^\/+|\/+$/g, '')
    const method = req.method.toLowerCase()
    const queryStringObject = parsedURL.query
    const headersObject = req.headers
    const decoder = new StringDecoder('utf-8')
    let realData = ''

    const requestProperties = {
        parsedURL,
        path,
        trimmedPath,
        method,
        queryStringObject,
        headersObject,
    }

    const chosenHandler = routes[trimmedPath] ? routes[trimmedPath] : notFoundHandler


    req.on('data', (buffer) => {
        realData += decoder.write(buffer)
    })

    req.on('end', () => {
        realData += decoder.end()

        requestProperties.body = parseJSON(realData)

        chosenHandler(requestProperties, (statusCode, payload) => {
            statusCode = typeof (statusCode) === 'number' ? statusCode : 500
            payload = typeof (payload) === 'object' ? payload : {}

            const payloadString = JSON.stringify(payload)

            // return the final response
            res.setHeader('Content-Type', 'application/json')
            res.writeHead(statusCode)
            res.end(payloadString)
        })
    })

}

module.exports = handler