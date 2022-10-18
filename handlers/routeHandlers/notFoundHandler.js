const handler = {}

handler.notFoundHandler = (requestProperties, callback) => {

    callback(404, {
        message: 'url not found'
    })
}

module.exports = handler