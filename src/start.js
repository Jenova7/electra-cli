const ElectraJs = require('electra-js')
const fs = require('fs')
const log = require('@inspired-beings/log')
const moment = require('moment')
const os = require('os')
const path = require('path')

const LOG_LENGTH = 20
const VERSION = require(path.resolve(__dirname, '..', `package.json`)).version

const electraJs = new ElectraJs({ isHard: true })
let timerId

async function refreshInfo() {
  const info = await electraJs.wallet.getInfo()
  const logLines = fs
    .readFileSync(path.resolve(electraJs.constants.DAEMON_USER_DIR_PATH, 'debug.log'), 'utf8')
    .split(os.EOL)
    .filter(line => !line.startsWith('ThreadRPCServer') && line.trim().length !== 0)

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
  log.info(logLines.slice(logLines.length - (LOG_LENGTH + 1), logLines.length - 1).join(os.EOL))

  timerId = setTimeout(refreshInfo, 250)
}

module.exports = async function () {
  process.on('SIGINT', async () => {
    if (timerId !== undefined) clearTimeout(timerId)
    log.clear()
    log.info('Stopping Electra daemon...')
    await electraJs.wallet.stopDaemon()
    log.info('Electra daemon stopped.')
    process.exit();
  })

  log.clear()
  log.info('Starting Electra daemon...')
  await electraJs.wallet.startDaemon()
  log.info('Electra daemon started.')

  await refreshInfo()
}
