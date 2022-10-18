const handler = {}
const data = require('../../lib/data')
const { hash, parseJSON, createRandomString } = require('../../helpers/utilities')

handler.tokenHandler = (requestProperties, callback) => {
    const acceptedMethods = ['get', 'post', 'put', 'delete']

    if (acceptedMethods.indexOf(requestProperties.method) > -1) {
        handler._token[requestProperties.method](requestProperties, callback)

    } else {
        callback(405)
    }
}

handler._token = {}

handler._token.post = (requestProperties, callback) => {

    const phoneNumber =
        typeof requestProperties.body.phoneNumber === 'string' && requestProperties.body.phoneNumber.trim().length === 11 ? requestProperties.body.phoneNumber : false

    const password =
        typeof requestProperties.body.password === 'string' && requestProperties.body.password.trim().length > 0 ? requestProperties.body.password : false

    if (phoneNumber && password) {

        data.read('users', phoneNumber, (err, userData) => {
            const hashedPassword = hash(password)
            if (hashedPassword === parseJSON(userData).password) {
                let tokenId = createRandomString(20)
                let expires = Date.now() + 60 * 60 * 1000
                let tokenObject = {
                    phoneNumber,
                    'id': tokenId,
                    expires
                }

                data.create('tokens', tokenId, tokenObject, (err) => {
                    if (!err) {
                        callback(200, tokenObject)
                    } else {
                        callback(500, {
                            error: 'Server side error occured!'
                        })
                    }
                })
            } else {
                callback(400, {
                    error: 'Password is not valid!'
                })
            }
        })

    } else {
        callback(400, {
            error: 'there was an error in your request!'
        })
    }
}

handler._token.get = (requestProperties, callback) => {
    const id =
        typeof requestProperties.queryStringObject.id === 'string' && requestProperties.queryStringObject.id.trim().length === 20 ? requestProperties.queryStringObject.id : false

    if (id) {
        data.read('tokens', id, (err, tokenData) => {
            const token = { ...parseJSON(tokenData) }
            if (!err && token) {
                callback(200, token)
            } else {
                callback(404, { error: "Requested token was not found!" })
            }
        })
    } else {
        callback(404, { error: "Requested token was not found!" })
    }
}

handler._token.put = (requestProperties, callback) => {
    const id =
        typeof requestProperties.body.id === 'string' && requestProperties.body.id.trim().length === 20 ? requestProperties.body.id : false

    const extend =
        typeof requestProperties.body.extend === 'boolean' && requestProperties.body.extend === true ? true : false

    if (id && extend) {
        data.read('tokens', id, (err, tokenData) => {
            let tokenObject = parseJSON(tokenData)
            if (tokenObject.expires > Date.now()) {
                tokenObject.expires = Date.now() + 60 * 60 * 1000

                data.update('tokens', id, tokenObject, (err) => {
                    if (!err) {
                        callback(200, { message: "Token was updated successfully." })
                    } else {
                        callback(500, { error: "Server side error occured!" })
                    }
                })
            } else {
                callback(400, { error: "Token already expired!" })
            }
        })
    } else {
        callback(400, { error: "There was a problem in your request!" })
    }
}

handler._token.delete = (requestProperties, callback) => {
    const id =
        typeof requestProperties.queryStringObject.id === 'string' && requestProperties.queryStringObject.id.trim().length === 20 ? requestProperties.queryStringObject.id : false

    if (id) {
        data.read('tokens', id, (err, tokenData) => {
            if (!err && tokenData) {
                data.delete('tokens', id, (err) => {
                    if (!err) {
                        callback(200, { message: "Token was deleted successfully!" })
                    } else {
                        callback(500, { error: "There was a server side error." })
                    }
                })
            } else {
                callback(500, { error: "There was a server side error." })
            }
        })
    } else {
        callback(400, { error: "There was a problem in your request!" })
    }
}

handler._token.verify = (id, phoneNumber, callback) => {
    data.read('tokens', id, (err, tokenData) => {
        if (!err && tokenData) {
            if (parseJSON(tokenData).phoneNumber === phoneNumber && parseJSON(tokenData).expires > Date.now()) {
                callback(true)
            } else {
                callback(false)
            }
        } else {
            callback(false)
        }
    })
}


module.exports = handler
