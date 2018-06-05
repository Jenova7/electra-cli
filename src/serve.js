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

const PORT = process.env.PORT || 80
const CONNECTIONS_COUNT_MAX = process.env.CONNECTIONS_COUNT_MAX || 10000
const LOG_LINES_MAX = 10000
const VERSION = require(path.resolve(__dirname, '..', `package.json`)).version

const electraJs = new ElectraJs({
  daemonConfig: {
    maxconnections: CONNECTIONS_COUNT_MAX,
    server: false,
  },
  isHard: true,
})

const LOG_PATH = path.resolve(electraJs.constants.DAEMON_USER_DIR_PATH, 'debug.log')

let lastLogLineIndex = 0
let timerId
let loopIndex = 0

async function refreshInfo() {
  const logSourceNewLines = getLogLines().slice(lastLogLineIndex)
  lastLogLineIndex += logSourceNewLines.length

  logSourceNewLines
    .filter(line => !line.startsWith('ThreadRPCServer') && line.trim().length !== 0)
    .forEach(line => log(line))

  if (loopIndex === 0) {
    const info = await electraJs.wallet.getInfo()
    // const cpuUsage = process.cpuUsage()

    log(`INFO ===========================================================================`)
    log.info(`Connections: %s.`, numeral(info.connectionsCount).format('0,0'))
    log.info(
      `Blocks: %s / %s.`,
      numeral(info.localBlockchainHeight).format('0,0'),
      numeral(info.networkBlockchainHeight).format('0,0')
    )
    log.info(`Last block generated at: %s.`, moment(info.lastBlockGeneratedAt * 1000).format())
    // log.info(
    //   `CPU used: %s / %s.`,
    //   numeral(memoryUsage.heapUsed).format('0,0'),
    //   numeral(memoryUsage.heapTotal).format('0,0')
    // )
    log.info(
      `Memory usage: %s / %s.`,
      numeral(os.totalmem() - os.freemem()).format('0.000b'),
      numeral(os.totalmem()).format('0.000b')
    )
    log(`================================================================================`)
  }

  if (lastLogLineIndex >= LOG_LINES_MAX) {
    try {
      log.info('Emptying %s...', LOG_PATH)
      fs.writeFileSync(LOG_PATH, '')
      lastLogLineIndex = 0
    }
    catch(err) {
      log.warn('Warning: %s', err)

      loopIndex = loopIndex === 29 ? 0 : loopIndex + 1
      timerId = setTimeout(refreshInfo, 1000)
    }
  }

  loopIndex = loopIndex === 29 ? 0 : loopIndex + 1
  timerId = setTimeout(refreshInfo, 1000)
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

  await refreshInfo()
}

run()
