#!/usr/bin/env node

const commander = require('commander')

const start = require('../src/start')

async function run() {
  await start()

  process.exit()
}

run()
