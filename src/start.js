#!/usr/bin/env node

const ElectraJs = require('electra-js')
const fs = require('fs')
const log = require('@inspired-beings/log')
const moment = require('moment')
const os = require('os')
const path = require('path')

const VERSION = require(path.resolve(__dirname, '..', `package.json`)).version

const electraJs = new ElectraJs({ isHard: true })

async function refreshInfo() {
  const info = await electraJs.wallet.getInfo()
  const logLines = fs.readFileSync(path.resolve(electraJs.constants.DAEMON_USER_DIR_PATH, 'debug.log'), 'utf8').split(os.EOL)

  log.clear()
  log(`Electra CLI v${VERSION}`)
  log()

  log('INFO')
  log('----------------------------------------')
  for (let prop in info) {
    log.info(`${prop}: ${info[prop]}`)
  }
  log()

  log(`LOG                             ${moment().format('hh:mm:ss')}`)
  log('----------------------------------------')
  log.info(logLines.slice(logLines.length - 11, logLines.length - 1).join(os.EOL))

  setTimeout(refreshInfo, 250)
}

module.exports = async function () {
  process.on('SIGINT', async () => {
    await electraJs.wallet.stopDaemon()
    process.exit();
  })

  await electraJs.wallet.startDaemon()

  await refreshInfo()
}
