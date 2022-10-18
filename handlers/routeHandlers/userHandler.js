const data = require('../../lib/data')
const { hash, parseJSON } = require('../../helpers/utilities')
const tokenHandler = require('./tokenHandler')

// module scaffolding
const handler = {}

handler.userHandler = (requestProperties, callback) => {
    const acceptedMethods = ['get', 'post', 'put', 'delete']

    if (acceptedMethods.indexOf(requestProperties.method) > -1) {
        handler._users[requestProperties.method](requestProperties, callback)

    } else {
        callback(405)
    }
}

handler._users = {}

handler._users.post = (requestProperties, callback) => {
    const firstName =
        typeof requestProperties.body.firstName === 'string' && requestProperties.body.firstName.trim().length > 0 ? requestProperties.body.firstName : false

    const lastName =
        typeof requestProperties.body.lastName === 'string' && requestProperties.body.lastName.trim().length > 0 ? requestProperties.body.lastName : false

    const phoneNumber =
        typeof requestProperties.body.phoneNumber === 'string' && requestProperties.body.phoneNumber.trim().length === 11 ? requestProperties.body.phoneNumber : false

    const password =
        typeof requestProperties.body.password === 'string' && requestProperties.body.password.trim().length > 0 ? requestProperties.body.password : false

    const tosAgreement =
        typeof requestProperties.body.tosAgreement === 'boolean' &&
            requestProperties.body.tosAgreement
            ? requestProperties.body.tosAgreement
            : false;

    if (firstName && lastName && phoneNumber && password && tosAgreement) {
        data.read('users', phoneNumber, (err) => {
            if (err) {
                let userObject = {
                    firstName,
                    lastName,
                    phoneNumber,
                    password: hash(password),
                    tosAgreement
                }

                data.create('users', phoneNumber, userObject, (err) => {
                    if (!err) {
                        callback(200, {
                            message: 'User was created successfully!'
                        })
                    } else {
                        callback(500, { message: "Couldn't create user!" })
                    }
                })
            } else {
                callback(500, {
                    error: 'there was an error in server side!'
                })
            }
        })
    } else {
        callback(400, {
            error: 'there was an error in your request!'
        })
    }
}


handler._users.get = (requestProperties, callback) => {
    const phoneNumber =
        typeof requestProperties.queryStringObject.phoneNumber === 'string' && requestProperties.queryStringObject.phoneNumber.trim().length === 11 ? requestProperties.queryStringObject.phoneNumber : false

    if (phoneNumber) {

        let token = typeof (requestProperties.headersObject.token) === 'string' ? requestProperties.headersObject.token : false

        tokenHandler._token.verify(token, phoneNumber, (tokenId) => {
            if (tokenId) {
                data.read('users', phoneNumber, (err, u) => {
                    const user = { ...parseJSON(u) }
                    if (!err && user) {
                        delete user.password
                        callback(200, user)
                    } else {
                        callback(404, { error: "Requested user was not found!" })
                    }
                })
            } else {
                callback(403, { error: "Authentication failure!" })
            }
        })

    } else {
        callback(404, { error: "Requested user was not found!" })
    }
}


handler._users.put = (requestProperties, callback) => {
    const phoneNumber =
        typeof requestProperties.body.phoneNumber === 'string' && requestProperties.body.phoneNumber.trim().length === 11 ? requestProperties.body.phoneNumber : false

    const firstName =
        typeof requestProperties.body.firstName === 'string' && requestProperties.body.firstName.trim().length > 0 ? requestProperties.body.firstName : false

    const lastName =
        typeof requestProperties.body.lastName === 'string' && requestProperties.body.lastName.trim().length > 0 ? requestProperties.body.lastName : false

    const password =
        typeof requestProperties.body.password === 'string' && requestProperties.body.password.trim().length > 0 ? requestProperties.body.password : false

    if (phoneNumber) {

        let token = typeof (requestProperties.headersObject.token) === 'string' ? requestProperties.headersObject.token : false

        tokenHandler._token.verify(token, phoneNumber, (tokenId) => {
            if (tokenId) {
                if (firstName || lastName || password) {
                    data.read('users', phoneNumber, (err, uData) => {
                        const userData = { ...parseJSON(uData) }

                        if (!err && userData) {
                            if (firstName) {
                                userData.firstName = firstName
                            }

                            if (lastName) {
                                userData.lastName = lastName
                            }

                            if (password) {
                                userData.password = hash(password)
                            }

                            data.update('users', phoneNumber, userData, (err) => {
                                if (!err) {
                                    callback(200, { message: "User was updated successfully." })
                                } else {
                                    callback(500, { error: "There was an error in server side!" })
                                }
                            })
                        } else {
                            callback(400, { error: "An error occured in your request!" })
                        }
                    })
                } else {
                    callback(400, { error: "An error occured in your request!" })
                }
            } else {
                callback(403, { error: "Authentication failure!" })
            }
        })
        
    } else {
        callback(400, { error: "Invalid phone number. Please try again!" })
    }
}


handler._users.delete = (requestProperties, callback) => {
    const phoneNumber =
        typeof requestProperties.queryStringObject.phoneNumber === 'string' && requestProperties.queryStringObject.phoneNumber.trim().length === 11 ? requestProperties.queryStringObject.phoneNumber : false

    if (phoneNumber) {

        let token = typeof (requestProperties.headersObject.token) === 'string' ? requestProperties.headersObject.token : false

        tokenHandler._token.verify(token, phoneNumber, (tokenId) => {
            if (tokenId) {
                data.read('users', phoneNumber, (err, userData) => {
                    if (!err && userData) {
                        data.delete('users', phoneNumber, (err) => {
                            if (!err) {
                                callback(200, { message: "User was deleted successfully!" })
                            } else {
                                callback(500, { error: "There was a server side error." })
                            }
                        })
                    } else {
                        callback(500, { error: "There was a server side error." })
                    }
                })
            } else {
                callback(403, { error: "Authentication failure!" })
            }
        })
        
    } else {
        callback(400, { error: "There was a problem in your request!" })
    }
}
module.exports = handler
