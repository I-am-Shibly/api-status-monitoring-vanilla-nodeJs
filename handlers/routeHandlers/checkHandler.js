const handler = {}
const data = require('../../lib/data')
const { hash, parseJSON, createRandomString } = require('../../helpers/utilities')
const tokenHandler = require('./tokenHandler')
const { maxCheck } = require('../../helpers/environments')

handler.checkHandler = (requestProperties, callback) => {
    const acceptedMethods = ['get', 'post', 'put', 'delete']

    if (acceptedMethods.indexOf(requestProperties.method) > -1) {
        handler._check[requestProperties.method](requestProperties, callback)

    } else {
        callback(405)
    }
}

handler._check = {}

handler._check.post = (requestProperties, callback) => {

    let protocol = typeof (requestProperties.body.protocol) === 'string' && ['http', 'https'].indexOf(requestProperties.body.protocol) > -1 ? requestProperties.body.protocol : false

    let url = typeof (requestProperties.body.url) === 'string' && requestProperties.body.url.trim().length > 1 ? requestProperties.body.url : false

    let method = typeof (requestProperties.body.method) === 'string' && ['get', 'post', 'put', 'delete'].indexOf(requestProperties.body.method) > -1 ? requestProperties.body.method : false

    let successCode = typeof (requestProperties.body.successCode) === 'object' && requestProperties.body.successCode instanceof Array ? requestProperties.body.successCode : false

    let timeOutSeconds = typeof (requestProperties.body.timeOutSeconds) === 'number' && requestProperties.body.timeOutSeconds % 1 === 0 && requestProperties.body.timeOutSeconds >= 1 && requestProperties.body.timeOutSeconds <= 5 ? requestProperties.body.timeOutSeconds : false


    if (protocol && url && method && successCode && timeOutSeconds) {

        let token = typeof (requestProperties.headersObject.token) === 'string' ? requestProperties.headersObject.token : false

        data.read('tokens', token, (err, tokenData) => {
            if (!err && tokenData) {
                let userPhone = parseJSON(tokenData).phoneNumber

                data.read('users', userPhone, (err, userData) => {
                    if (!err && userData) {
                        tokenHandler._token.verify(token, userPhone, (tokenIsValid) => {
                            if (tokenIsValid) {
                                let userObject = parseJSON(userData)
                                let userChecks = typeof (userObject.checks) === 'object' && userObject.checks instanceof Array ? userObject.checks : []

                                if (userChecks.length < maxCheck) {
                                    let checkId = createRandomString(20)
                                    
                                    let checkObject = {
                                        checkId,
                                        userPhone,
                                        protocol,
                                        url,
                                        method,
                                        successCode,
                                        timeOutSeconds
                                    }
                                    // save the object
                                    data.create('checks', checkId, checkObject, (err) => {
                                        if (!err) {
                                            // add checkId to user's object
                                            userObject.checks = userChecks
                                            userObject.checks.push(checkId)

                                            // save the new data 
                                            data.update('users', userPhone, userObject, (err) => {
                                                if (!err) {
                                                    callback(200, checkObject)
                                                } else {
                                                    callback(500, { error: "Server side error!" }) 
                                                }
                                            })
                                        } else {
                                            callback(500, { error: "Server side error!" })
                                        }
                                    })
                                } else {
                                    callback(401, { error: "User reached maximum check limit!" })
                                }
                            } else {
                                callback(403, { error: "Authentication error!" })
                            }
                        })
                    } else {
                        callback(403, { error: "User not found!" })
                    }
                })
            } else {
                callback(403, { error: "Authentication error!" })
            }
        })

    } else {
        callback(400, { error: "An error occured in your request!" })
    }
}


handler._check.get = (requestProperties, callback) => {
    const id =
        typeof requestProperties.queryStringObject.id === 'string' && requestProperties.queryStringObject.id.trim().length === 20 ? requestProperties.queryStringObject.id : false

    if (id) {
        data.read('checks', id, (err, checkData) => {
            if (!err && checkData) {
                
                let token = typeof (requestProperties.headersObject.token) === 'string' ? requestProperties.headersObject.token : false

                tokenHandler._token.verify(token, parseJSON(checkData).userPhone, (tokenIsValid) => {
                    if (tokenIsValid) { 
                        callback(200, parseJSON(checkData))
                    } else {
                        callback(403, { error: "User not found!" })
                    }
            })
                
            } else {
                callback(403, { error: "Authentication error!" })
            }
        })
    } else {
        callback(400, { error: "An error occured in your request!" })
    }
}


handler._check.put = (requestProperties, callback) => {
    const id =
        typeof requestProperties.body.id === 'string' && requestProperties.body.id.trim().length === 20 ? requestProperties.body.id : false
    
    let protocol = typeof (requestProperties.body.protocol) === 'string' && ['http', 'https'].indexOf(requestProperties.body.protocol) > -1 ? requestProperties.body.protocol : false

    let url = typeof (requestProperties.body.url) === 'string' && requestProperties.body.url.trim().length > 1 ? requestProperties.body.url : false

    let method = typeof (requestProperties.body.method) === 'string' && ['get', 'post', 'put', 'delete'].indexOf(requestProperties.body.method) > -1 ? requestProperties.body.method : false

    let successCode = typeof (requestProperties.body.successCode) === 'object' && requestProperties.body.successCode instanceof Array ? requestProperties.body.successCode : false

    let timeOutSeconds = typeof (requestProperties.body.timeOutSeconds) === 'number' && requestProperties.body.timeOutSeconds % 1 === 0 && requestProperties.body.timeOutSeconds >= 1 && requestProperties.body.timeOutSeconds <= 5 ? requestProperties.body.timeOutSeconds : false

    console.log(id);
    if (id) {
        if (protocol || url || method || successCode || timeOutSeconds) {
            data.read('checks', id, (err, checkData) => {
                if (!err && checkData) {
                    let checkObject = parseJSON(checkData)
                    let token = typeof (requestProperties.headersObject.token) === 'string' ? requestProperties.headersObject.token : false

                    tokenHandler._token.verify(token, checkObject.userPhone, (tokenIsValid) => {
                        if (protocol) {
                            checkObject.protocol = protocol
                        }

                        if (url) {
                            checkObject.url = url
                        }

                        if (method) {
                            checkObject.method = method
                        }

                        if (successCode) {
                            protocol.successCode = successCode
                        }

                        if (timeOutSeconds) {
                            protocol.timeOutSeconds = timeOutSeconds
                        }

                        data.update('checks', id, checkObject, (err) => {
                            if (!err) {
                                callback(200)
                            } else {
                                callback(500, { error: "Server side error!" })
                            }
                        })
                    })
                } else {
                    callback(403, { error: "Authentication error!" })
                }
            })
        } else {
            callback(400, { error: "You must provide at least one field to update!" })
        }
        
    } else {
        callback(400, { error: "An error occured in your request!" })  
    }
}


handler._check.delete = (requestProperties, callback) => {
    const id =
        typeof requestProperties.queryStringObject.id === 'string' && requestProperties.queryStringObject.id.trim().length === 20 ? requestProperties.queryStringObject.id : false

    if (id) {
        data.read('checks', id, (err, checkData) => {
            if (!err && checkData) {

                let token = typeof (requestProperties.headersObject.token) === 'string' ? requestProperties.headersObject.token : false

                tokenHandler._token.verify(token, parseJSON(checkData).userPhone, (tokenIsValid) => {
                    if (tokenIsValid) {
                        data.delete('checks', id, (err) => {
                            if (!err) {
                                data.read('users', parseJSON(checkData).userPhone, (err, userData) => {
                                    let userObject = parseJSON(userData)
                                    if (!err && userData) {
                                        let userChecks = typeof (userObject.checks) === 'object' && userObject.checks instanceof Array ? userObject.checks : []

                                        // remove the checkId from user's list
                                        const checkPosition = userChecks.indexOf(id)

                                        if (checkPosition > -1) {
                                            userChecks.splice(checkPosition, 1)

                                            userObject.checks = userChecks

                                            data.update('users', userObject.phoneNumber, userObject, (err) => {
                                                if (!err) {
                                                    callback(200)
                                                } else {
                                                    callback(500, { error: "Server side error!" })
                                                }
                                            })
                                        } else {
                                            callback(500, { error: "requesting id was not found!" })
                                        }
                                    } else {
                                        callback(500, { error: "Server side error!" })
                                    }
                                })
                            } else {
                                callback(500, { error: "Server side error!" })
                            }
                        })
                    } else {
                        callback(403, { error: "User not found!" })
                    }
                })

            } else {
                callback(403, { error: "Authentication error!" })
            }
        })
    } else {
        callback(400, { error: "An error occured in your request!" })
    }
}

module.exports = handler
