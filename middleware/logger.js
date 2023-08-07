const { format } = require('date-fns')
const { v4: uuid} = require('uuid')
const fs = require('fs')
const fsPromises = require('fs').promises
const path = require('path')

//Helper function: creates a format for date/time stamp and then logs an item with that but also a unique identifier (uuid)
const logEvents = async (message, logFileName) => {
    const dateTime = format(new Date(), 'yyyyMMdd\tHH:mm:ss')
    const logItem = `${dateTime}\t${uuid()}\t${message}\n`

    //checking does the path exist, if not, create it. If it does, add/append it.
    try {
        if (!fs.existsSync(path.join(__dirname, '..', 'logs'))) {
            await fsPromises.mkdir(path.join(__dirname, '..', 'logs'))
        }
        await fsPromises.appendFile(path.join(__dirname, '..', 'logs', logFileName), logItem)
    } catch (err) {
        console.log(err)
    }
}

//middleware function to log requests. Should be more specific on what req. you want to log.
const logger = (req, res, next) => {
    logEvents(`${req.method}\t${req.url}\t${req.headers.origin}`, 'reqLog.log')

    console.log(`${req.method} ${req.path}`)

    next()
}

module.exports = { logEvents, logger}