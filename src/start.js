const ElectraJs = require('electra-js')
const fs = require('fs')
const log = require('@inspired-beings/log')
const moment = require('moment')
const numeral = require('numeral')
const os = require('os')
const path = require('path')
const rimraf = require('rimraf')

const onSigint = require('./helpers/onSigint')

const LOG_LENGTH = 5
const VERSION = require(path.resolve(__dirname, '..', `package.json`)).version

const electraJs = new ElectraJs({ isHard: true })
let addresses
let timerId

async function refreshInfo() {
  for (let i = 0; i < addresses.length; i++) {
    const res = await electraJs.wallet.getAddressBalance(addresses[i].hash)
    addresses[i].amount = numeral(res.confirmed + res.unconfirmed).format('0,0.00000000')
  }

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
  log.info(`Connections: ${info.connectionsCount}`)
  log.info(`Last block generated: ${moment(info.lastBlockGeneratedAt * 1000).fromNow()}`)
  log.info(`Blockchain height: ${numeral(info.localBlockchainHeight).format('0,0')} / ${numeral(info.networkBlockchainHeight).format('0,0')}`)
  log()

  log('ADDRESSES')
  log('----------------------------------------')
  addresses.map(address => log.info(`${address.hash}: ${address.amount}`))
  log()

  log(`LOG                             ${moment().format('hh:mm:ss')}`)
  log('----------------------------------------')
  log.info(logLines.slice(logLines.length - (LOG_LENGTH + 1), logLines.length - 1).join(os.EOL))

  timerId = setTimeout(refreshInfo, 250)
}

module.exports = async function (options) {
  if (options.rebuild) {
    log.info('Removing all Electra user directory files BUT keeping the "wallet.dat" file...')

    try {
      rimraf.sync(path.resolve(electraJs.constants.DAEMON_USER_DIR_PATH, '!(wallet.dat)'))
    }
    catch {
      log.err(`Error: ${err}`)
    }
  }

  onSigint(async () => {
    if (timerId !== undefined) clearTimeout(timerId)
    log.clear()
    log.info('Stopping Electra daemon...')
    await electraJs.wallet.stopDaemon()
    log.info('Electra daemon stopped.')
    process.exit()
  })

  log.clear()
  log.info('Starting Electra daemon...')
  await electraJs.wallet.startDaemon()
  log.info('Electra daemon started.')

  log.info('Fetching wallet.dat addresses...')
  addresses = (await electraJs.wallet.getDaemonAddresses()).map(hash => ({ hash }))

  await refreshInfo()
}
