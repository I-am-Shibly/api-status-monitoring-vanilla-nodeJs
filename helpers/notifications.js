const https = require('https')
const { twilio } = require('./environments')
const querystring = require('querystring')

const notifications = {}

notifications.sendTwilioSms = (phone, msg, callback) => {
    const userPhone = typeof (phone) === 'string' && phone.trim().length === 11 ? phone.trim() : false

    const userMsg = typeof (msg) === 'string' && msg.trim().length > 0 && msg.trim().length <= 1600 ? msg.trim() : false

    if (userPhone && userMsg) {
        
        // configure request payload
        const payload = {
            From: twilio.fromNumber,
            To: `+88${userPhone}`,
            Body: userMsg
        }

        const stringifyPayload = querystring.stringify(payload)

        const requestDetails = {
            hostname: 'api.twilio.com',
            method: 'POST',
            path: `/2010-04-01/Accounts/${twilio.accountSid}/Messages`,
            auth: `${twilio.accountSid}:${twilio.authToken}`,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            } 
        }

         // instantiate request object
        const req = https.request(requestDetails, (res) => {
            const status = res.statusCode

            if (status === 200 || status === 201 || status === 301) {
                callback(false)
            } else {
                callback(`Status code returned was ${status}`)
            }
        })

        req.on('error', (e) => {
            callback(e)
        })

        req.write(stringifyPayload)
        req.end()
    } else {
      callback("Given parameters are incorrect!")  
     }
}

module.exports = notifications