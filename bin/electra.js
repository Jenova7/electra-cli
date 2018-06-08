#!/usr/bin/env node

const commander = require('commander')
const path = require('path')

const BINARY_PATH = path.resolve(
  __dirname,
  'node_modules',
  'electra-js',
  'bin',
  `electrad-${{ 'darwin': 'macos', 'linux': 'linux', 'win32': 'windows' }[process.platform]}`
)
const VERSION = require(path.resolve(__dirname, '..', `package.json`)).version

commander
  .version(VERSION)
  .command('serve', 'Start the Bootstrap Node server.')
  .command('start', 'Start the daemon and watch it.')
  .parse(process.argv)
