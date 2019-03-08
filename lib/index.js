const fs = require('fs')
const path = require('path')
const camelCase = require('just-camel-case')

const commands = fs.readdirSync(path.join(__dirname, 'commands'))
  .filter(filename => !/^(\.|_)/.test(filename))
  .reduce((result, filename) => {
    result[filename.slice(0, -3)] = require(`./commands/${filename}`)
  }, {})

async function main () {
  // TODO: actual arg parser
  const argv = process.argv
    .slice(2)
    .reduce((result, arg) => {
      if (arg.startsWith('--')) {
        let [ key, value ] = arg.split('=')

        key = key.slice(2)
        value = value || true
        result[key] = value
        result[camelCase(key)] = value
      } else {
        result._ = result._ || []
        result._.push(arg)
      }

      return result
    }, {})
  const [ command ] = argv._

  if (commands.hasOwnProperty(command)) {
    return commands[command](argv)
  } else {
    throw new Error(`Command not found: ${command}`)
  }
}

main().catch(console.error)
