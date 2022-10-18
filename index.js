/*
    *Title: Initial file
    *Description: A RESTful API to monitor up or down time of user defined links
    *Author: Samiul Islam Shibly
    *Date: 03/10/22
*/

// Depedencies
const server = require('./lib/server')
const workers = require('./lib/worker')
const http = require('http')
const { handleReqRes } = require('./helpers/handleReqRes')
const environment = require('./helpers/environments')
const data =  require('./lib/data')

// App object- module scaffolding
const app = {}

app.init = () => {
    // start the server
    server.init()
    
    // start the worker
    workers.init()
}

app.init()

module.exports = app