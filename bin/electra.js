#!/usr/bin/env node

const chalk = require('chalk')
const commander = require('commander')
const path = require('path')
const updateNotifier = require('update-notifier')

const package = require(path.resolve(__dirname, '..', `package.json`))

const BINARY_PATH = path.resolve(
  __dirname,
  'node_modules',
  'electra-js',
  'bin',
  `electrad-${{ 'darwin': 'macos', 'linux': 'linux', 'win32': 'windows' }[process.platform]}`
)

updateNotifier({ pkg: package }).notify()

commander
  .version(package.version)
  .command('serve', 'Start the Bootstrap Node server.')
  .command('start', 'Start the daemon and watch it.')
  .parse(process.argv)
