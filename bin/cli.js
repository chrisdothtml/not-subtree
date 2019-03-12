#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const camelCase = require('just-camel-case')
const sade = require('sade')
const pkgJson = require('../package.json')
const [ binName ] = Object.entries(pkgJson.bin)[0]
const cli = sade(binName)
  .version(`v${pkgJson.version}`)

fs.readdirSync(path.resolve(__dirname, '../commands'))
  .filter(filename => !/^(\.|_)/.test(filename))
  .forEach((filename) => {
    require(`../commands/${filename}`)(cli)
  })

const parsedCli = cli.parse(process.argv, { lazy: true })

if (parsedCli) {
  const { args, handler } = parsedCli
  const argv = args[args.length - 1]

  // camelCase args with dashes
  for (const [ key, value ] of Object.entries(argv)) {
    if (key.includes('-')) {
      argv[camelCase(key)] = value
    }
  }

  handler(argv)
}
