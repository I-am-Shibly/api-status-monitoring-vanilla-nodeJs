/*
    *Title: Worker lib
    *Description: A RESTful API to monitor up or down time of user defined links
    *Author: Samiul Islam Shibly
    *Date: 03/10/22
*/

// Depedencies
const url = require('url')
const http = require('http')
const https = require('https')
const path = require('path')
const data = require('./data')
const { parseJSON } = require('../helpers/utilities')
const { sendTwilioSms } = require('../helpers/notifications')

// Worker object- module scaffolding
const worker = {}

worker.gatherAllChecks = () => {
    data.list('checks', (err, checks) => {
        if (!err && checks && checks.length > 0) {
            checks.forEach(check => {
                data.read('checks', check, (err, checkData) => {
                    if (!err && checkData) {
                        worker.validateCheckData(parseJSON(checkData))
                    } else {
                        console.log('error reading check data!');
                    }
                })
            });
        } else {
            console.log('Could not find any checks!');
        }
    })
}

// validate function
worker.validateCheckData = (checkData) => {
    if (checkData && checkData.checkId) {
        checkData.state = typeof (checkData.state) === 'string' && ['up', 'down'].indexOf(checkData.state) > -1 ? checkData.state : 'down'

        checkData.lastChecked = typeof (checkData.lastChecked) === 'number' && checkData.lastChecked > 0 ? checkData.lastChecked : false

        worker.performCheck(checkData)
    } else {
        console.log('check was invalid!');
    }
}

worker.performCheck = (checkData) => {
    // initial check outcome
    let checkOutCome = {
        'error': false,
        'responseCode': false
    }

    // check that outcome has not been sent yet
    let outComeSent = false

    let parsedUrl = url.parse(checkData.protocol + '://' + checkData.url, true)
    const hostName = parsedUrl.hostname
    const path = parsedUrl.path

    const requestDetails = {
        'protocol': checkData.protocol + ':',
        'hostname': hostName,
        'method': checkData.method.toUpperCase(),
        'path': path,
        'timeout': checkData.timeOutSeconds * 60
    }

    const protocolToUse = checkData.protocol === 'http' ? http : https

    let req = protocolToUse.request(requestDetails, (res) => {
        // grab the status of the response
        const status = res.statusCode

        // update the check status and pass to the next process
        checkOutCome.responseCode = status
        if (!outComeSent) {
            worker.processCheckOutCome(checkData, checkOutCome)
            checkOutCome = true
        }
    })

    req.on('error', e => {
        let checkOutCome = {
            'error': true,
            'value': e,
        }

        if (!outComeSent) {
            worker.processCheckOutCome(checkData, checkOutCome)
            checkOutCome = true
        }
    })

    req.on('timeout', () => {
        let checkOutCome = {
            'error': true,
            'value': 'timeout'
        }

        if (!outComeSent) {
            worker.processCheckOutCome(checkData, checkOutCome)
            checkOutCome = true
        }
    })

    req.end()
}


// save check outcome to the database and send to next process
worker.processCheckOutCome = (checkData, checkOutCome) => {
    // check if outcome is up or down
    let state = !checkOutCome.error && checkOutCome.responseCode && checkData.successCode.indexOf(checkOutCome.responseCode) > -1 ? 'up' : 'down'

    // decide whether notify the user or not
    let willAlert = checkData.lastChecked && checkData.state !== state ? true : false

    // update the check data
    let newCheckData = checkData

    newCheckData.state = state
    newCheckData.lastChecked = Date.now()

    // update database
    data.update('checks', newCheckData.checkId, newCheckData, err => {
        if (!err) {
            if (willAlert) {
                worker.alerAtStatusChange(newCheckData)
            } else {
                console.log('Alert is not needed as there is no state change.');
            }
        } else {
            console.log('error: failed to update the checks!');
        }
    })
}

// send sms notification to the user if state changes
worker.alerAtStatusChange = (newCheckData) => {
    const msg = `Alert: Your check for ${newCheckData.protocol.toUpperCase()} ${newCheckData.method}://${newCheckData.url} is currently ${newCheckData.state}`
    sendTwilioSms(newCheckData.userPhone, msg, (err) => {
        console.log(err);
        if (!err) {
            console.log(`Alert sent to the user. Message: ${msg}`);
        } else{
            console.log('There was a problem sending sms!');
        }
    })
}

worker.loop = () => {
    setInterval(() => {
        worker.gatherAllChecks()
    }, 8000)
}


worker.init = () => {
    // gather all checks
    worker.gatherAllChecks()

    // loop through the checks 
    worker.loop()
}

module.exports = worker