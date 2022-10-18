const environments = {}

environments.development = {
    port: 3000,
    envName: 'dev',
    secretKey: 'arkfeawkjfekrelrj',
    maxCheck: 25,
    twilio: {
        fromNumber: "+12055095752",
        accountSid: 'ACcf2d00ded82d56f65abb15510fe29f9a',
        authToken: 'fb6164182791cd6d6667fd595ebb4b71'
    }
}

environments.production = {
    port: 4000,
    envName: 'production',
    secretKey: 'lzfeowkwgwmfpdlcs',
    maxCheck: 25,
    twilio: {
        fromNumber: "+12055095752",
        accountSid: 'ACcf2d00ded82d56f65abb15510fe29f9a',
        authToken: 'fb6164182791cd6d6667fd595ebb4b71'
    }
}

const currentEnvironment = typeof process.env.NODE_ENV === 'string' ? process.env.NODE_ENV : 'development'

const environmentToExport = typeof environments[currentEnvironment] === 'object' ? environments[currentEnvironment] : environments.development

module.exports = environmentToExport