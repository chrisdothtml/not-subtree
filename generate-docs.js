const fs = require('fs')
const path = require('path')
const execa = require('execa')
const pkgJson = require('./package.json')
let [ BIN_NAME, BIN_PATH ] = Object.entries(pkgJson.bin)[0]
BIN_PATH = path.resolve(__dirname, BIN_PATH)

async function generate () {
  return Promise.all(
    fs.readdirSync('commands')
      .filter(filename => !/^(\.|_)/.test(filename))
      .map(async (filename) => {
        const command = filename.slice(0, -3)
        const { stdout } = await execa.shell(`${BIN_PATH} ${command} --help`)
        const helpText = stdout
          .split('\n')
          // first and last lines are empty
          .slice(1, -1)
          // un-indent
          .map(line => line.slice(2))
          .join('\n')

        return `### ${BIN_NAME} ${command}\n\n\`\`\`\n${helpText}\n\`\`\``
      })
  ).then(commands => '\n\n' + commands.join('\n\n') + '\n')
}

async function main () {
  const docs = await generate()
  const newReadmeContent = fs.readFileSync('readme.md', 'utf-8')
    .split(/\n(## [^\n]+)/)
    .map((value, i, arr) => {
      if (arr[i - 1] === '## Use') {
        return docs
      } else if (value.startsWith('## ')) {
        return '\n' + value
      } else {
        return value
      }
    })
    .join('')

  fs.writeFileSync('readme.md', newReadmeContent)
}

main().catch(console.error)
