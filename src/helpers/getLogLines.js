const ElectraJs = require('electra-js')
const fs = require('fs')
const os = require('os')
const path = require('path')

const electraJs = new ElectraJs({ isHard: true })
let logPath = path.resolve(electraJs.constants.DAEMON_USER_DIR_PATH, 'debug.log')

module.exports = function() {
  return fs.existsSync(logPath) ? fs.readFileSync(logPath, 'utf8').split(os.EOL) :  []
}
