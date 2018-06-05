const log = require('@inspired-beings/log')
const ElectraJs = require('electra-js')
const express = require('express')
const fs = require('fs')
const moment = require('moment')
const os = require('os')
const path = require('path')

const onSigint = require('./helpers/onSigint')

const LOG_LENGTH = 20
const PORT = process.env.PORT || 3000
const VERSION = require(path.resolve(__dirname, '..', `package.json`)).version

const electraJs = new ElectraJs({ isHard: true })

let logPath = path.resolve(electraJs.constants.DAEMON_USER_DIR_PATH, 'debug.log')
let logCacheLines = fs.readFileSync(logPath, 'utf8').split(os.EOL)
let timerId

async function refreshInfo() {
  // const info = await electraJs.wallet.getInfo()
  const logSourceNewLines = fs.readFileSync(logPath, 'utf8').split(os.EOL).slice(logCacheLines.length)
  logCacheLines = logCacheLines.concat(logSourceNewLines)

  logSourceNewLines
    .filter(line => !line.startsWith('ThreadRPCServer') && line.trim().length !== 0)
    .forEach(line => log(`%s ${line}`, moment().format('hh:mm:ss')))

  timerId = setTimeout(refreshInfo, 500)
}

function serve() {
  return new Promise(resolve => {
    const app = express()
    app.get('/', (req, res) => res.send(`Electra CLI v${VERSION}`))
    app.listen(PORT, () => {
      log.info(`Express server listening on port ${PORT}.`)

      resolve()
    })
  })
}

async function run() {
  onSigint(async () => {
    if (timerId !== undefined) clearTimeout(timerId)
    log.info('Stopping Electra daemon...')
    await electraJs.wallet.stopDaemon()
    log.info('Electra daemon stopped.')
    process.exit()
  })

  log.warn(`Electra CLI v${VERSION}`)
  log.info('Starting Express server...')
  await serve()
  log.info('Starting Electra daemon...')
  await electraJs.wallet.startDaemon()
  log.info('Electra daemon started.')

  await refreshInfo()
}

run()
