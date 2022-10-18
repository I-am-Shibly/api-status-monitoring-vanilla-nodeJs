/*
    *Title: Server lib
    *Description: A RESTful API to monitor up or down time of user defined links
    *Author: Samiul Islam Shibly
    *Date: 03/10/22
*/

// Depedencies
const http = require('http')
const { handleReqRes } = require('../helpers/handleReqRes')
const environment = require('../helpers/environments')

// Server object- module scaffolding
const server = {}

// create server
server.createServer = () => {
    const serverCreator = http.createServer(server.handleReqRes)
    serverCreator.listen(environment.port, () => {
        console.log(`Environment variable is ${process.env.NODE_ENV}`);
        console.log(`listening to port ${environment.port}`);
    })
}

// handle request & response 
server.handleReqRes = handleReqRes

server.init = () => {
    server.createServer()
}

module.exports = server