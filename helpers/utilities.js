const crypto = require('crypto')
const environments = require('./environments')
const utilities = {}

utilities.parseJSON = (jsonString) => {
    let output;

    try {
        output = JSON.parse(jsonString)
    } catch {
        output = {}
    }

    return output
}

utilities.hash = (str) => {
    if (typeof (str) === 'string' && str.length > 0) {
        let hash = crypto.createHmac('sha256', environments.secretKey)
            .update(str)
            .digest('hex');

        return hash
    } else {
        return false
    }
}


utilities.createRandomString = (strlen) => {
    let length

    length = typeof (strlen) === 'number' && strlen > 0 ? strlen : false

    if (length) {

        let possibleCharacters = 'abcdefghijklmnopqrstuvwxyz012345689'
        let output = ''

        for (i = 1; i <= length; i++) {
            let randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length))

            output += randomCharacter
        }

        return output
    }
    else {

    }
}

module.exports = utilities