const log = require('@inspired-beings/log')
const ElectraJs = require('electra-js')
const express = require('express')
const moment = require('moment')
const path = require('path')

const getLogLines = require('./helpers/getLogLines')
const onSigint = require('./helpers/onSigint')

const PORT = process.env.PORT || 5817
const VERSION = require(path.resolve(__dirname, '..', `package.json`)).version

const electraJs = new ElectraJs({
  daemonConfig: {
    daemon: false,
    port: PORT,
  },
  isHard: true,
})

let logCacheLines = getLogLines()
let timerId

async function refreshInfo() {
  // const info = await electraJs.wallet.getInfo()
  const logSourceNewLines = getLogLines().slice(logCacheLines.length)
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
  // log.info('Starting Express server...')
  // await serve()
  log.info('Starting Electra daemon...')
  await electraJs.wallet.startDaemon()
  log.info('Electra daemon started.')

  await refreshInfo()
}

run()
