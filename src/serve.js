const log = require('@inspired-beings/log')
const ElectraJs = require('electra-js')
const express = require('express')
const path = require('path')

const download = require('./helpers/download')
const getGithubReleaseFileInfo = require('./helpers/getGithubReleaseFileInfo')
const getLogLines = require('./helpers/getLogLines')
const onSigint = require('./helpers/onSigint')
const unzip = require('./helpers/unzip')

const PORT = process.env.PORT || 3000
const VERSION = require(path.resolve(__dirname, '..', `package.json`)).version

const electraJs = new ElectraJs({
  daemonConfig: {
    port: PORT,
    server: true,
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
    .forEach(line => log(line))

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

  const fileName = 'electra-cli-serve-wallet.zip'
  const filePath = path.resolve(__dirname, '..', 'data', fileName)
  log.info(`Downloading %s...`, fileName)
  const fileInfo = await getGithubReleaseFileInfo(fileName)
  await download(fileInfo.browser_download_url, filePath, fileInfo.size)
  log.info(`Unzipping %s to %s...`, fileName, electraJs.constants.DAEMON_USER_DIR_PATH)
  await unzip(filePath, electraJs.constants.DAEMON_USER_DIR_PATH)

  // log.info('Starting Express server...')
  // await serve()

  log.info('Starting Electra daemon...')
  await electraJs.wallet.startDaemon()
  log.info('Electra daemon started.')

  await refreshInfo()
}

run()
