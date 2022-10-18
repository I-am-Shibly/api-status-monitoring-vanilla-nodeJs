const { sampleHandler } = require('./handlers/routeHandlers/sampleHandler')
const { userHandler } = require('./handlers/routeHandlers/userHandler')
const { checkHandler } = require('./handlers/routeHandlers/checkHandler')
const { tokenHandler } = require('./handlers/routeHandlers/tokenHandler')

const routes = {
    sample: sampleHandler,
    user: userHandler,
    token: tokenHandler,
    check: checkHandler,
}
module.exports = routes