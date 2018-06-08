#!/usr/bin/env node

const commander = require('commander')

commander
  .option('-r, --rebuild', `Let the wallet.dat as is but remove all the other Electra user
               directory files before starting the daemon.
               `)
  .parse(process.argv)

require('../src/start')({
  rebuild: Boolean(commander.rebuild),
})
