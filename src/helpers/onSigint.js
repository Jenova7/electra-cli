const readline = require('readline')

module.exports = function(callback) {
  if (process.platform === 'win32') {
    const readlineIntance = readline
      .createInterface({
        input: process.stdin,
        output: process.stdout
      })

    readlineIntance.on('SIGINT', () => process.emit('SIGINT'))
  }

  process.on('SIGINT', callback)
}
