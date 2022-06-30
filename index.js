#!/usr/bin/env node

const program = require('commander')
const { createConfigAction, AutoReleaseAction } = require('./action')

const createConfig = () => {
  program
    .command('file')
    .description('create a config file')
    .action(createConfigAction)
  program
    .command('release')
    .description('auto release to server')
    .action(AutoReleaseAction)
}

createConfig()

program.version(require('./package.json').version)

program.parse(process.argv)
