const readline = require('readline')

export default function(callback) {
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
