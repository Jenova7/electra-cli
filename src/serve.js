const log = require('@inspired-beings/log')
const ElectraJs = require('electra-js')
const fs = require('fs')
const moment = require('moment')
const numeral = require('numeral')
const os = require('os')
const path = require('path')

const download = require('./helpers/download')
const getGithubReleaseFileInfo = require('./helpers/getGithubReleaseFileInfo')
const getLogLines = require('./helpers/getLogLines')
const onSigint = require('./helpers/onSigint')
const unzip = require('./helpers/unzip')

const CONNECTIONS_COUNT_MAX = process.env.CONNECTIONS_COUNT_MAX || 1000
const LOG_LINES_MAX = 10000
const OPTIONS_DEFAULT = {
  debug: false,
}
const PORT = process.env.PORT || 80
const VERSION = require(path.resolve(__dirname, '..', `package.json`)).version

const electraJs = new ElectraJs({
  daemonConfig: {
    maxconnections: CONNECTIONS_COUNT_MAX,
    server: false,
  },
  isHard: true,
})

const LOG_PATH = path.resolve(electraJs.constants.DAEMON_USER_DIR_PATH, 'debug.log')

let timerId

async function refreshInfo() {
  const info = await electraJs.wallet.getInfo()
  // const cpuUsage = process.cpuUsage()

  const infoPretty = {
    connectionsCount: numeral(info.connectionsCount).format('0,0'),
    lastBlockGeneratedAt: moment(info.lastBlockGeneratedAt * 1000).format(),
    localBlockchainHeight: numeral(info.localBlockchainHeight).format('0,0'),
    networkBlockchainHeight: numeral(info.networkBlockchainHeight).format('0,0'),
    totalMemmory: numeral(os.totalmem()).format('0.000b'),
    usedMemmory: numeral(os.totalmem() - os.freemem()).format('0.000b'),
  }

  log.clear()
  log(`Electra CLI v${VERSION}`)
  log()

  log('INFO')
  log('--------------------------------------------------------------------------------')
  log.info('Connections: %s.', infoPretty.connectionsCount)
  log.info('Blocks: %s / %s.', infoPretty.localBlockchainHeight, infoPretty.networkBlockchainHeight)
  log.info('Last block generated at: %s.', infoPretty.lastBlockGeneratedAt)
  // log.info(
  //   'CPU used: %s / %s.',
  //   numeral(memoryUsage.heapUsed).format('0,0'),
  //   numeral(memoryUsage.heapTotal).format('0,0')
  // )
  log.info(`Memory usage: %s / %s.`, infoPretty.usedMemmory, infoPretty.totalMemmory)

  if (getLogLines().length >= LOG_LINES_MAX) {
    log()
    log('ACTION')
    log('--------------------------------------------------------------------------------')

    try {
      log.info('Emptying %s...', LOG_PATH)
      fs.writeFileSync(LOG_PATH, '')
      lastLogLineIndex = 0
    }
    catch(err) {
      log.warn('Warning: %s', err)

      timerId = setTimeout(refreshInfo, 5000)
    }
  }

  timerId = setTimeout(refreshInfo, 5000)
}

async function run() {
  const options = OPTIONS_DEFAULT

  onSigint(async () => {
    if (timerId !== undefined) clearTimeout(timerId)
    log.info('Stopping Electra daemon...')
    await electraJs.wallet.stopDaemon()
    log.info('Electra daemon stopped.')
    process.exit()
  })

  log.warn(`Electra CLI v${VERSION}`)

  if (!fs.existsSync(electraJs.constants.DAEMON_USER_DIR_PATH)) {
    const fileName = 'electra-cli-serve-wallet.zip'
    const filePath = path.resolve(__dirname, '..', 'data', fileName)
    log.info(`Downloading %s...`, fileName)
    const fileInfo = await getGithubReleaseFileInfo(fileName)
    await download(fileInfo.browser_download_url, filePath, fileInfo.size)
    log.info(`Unzipping %s to %s...`, fileName, electraJs.constants.DAEMON_USER_DIR_PATH)
    await unzip(filePath, electraJs.constants.DAEMON_USER_DIR_PATH)
  }

  if (fs.existsSync(LOG_PATH)) {
    log.info('Emptying %s...', LOG_PATH)
    fs.writeFileSync(LOG_PATH, '')
  }

  log.info('Starting Electra daemon...')
  await electraJs.wallet.startDaemon()
  log.info('Electra daemon started.')

  await refreshInfo(options)
}

run()
