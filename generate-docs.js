const fs = require('fs')
const path = require('path')
const execa = require('execa')
const pkgJson = require('./package.json')
const CLI_PATH = path.resolve(__dirname, pkgJson.bin)

async function generate () {
  return Promise.all(
    fs.readdirSync('commands')
      .filter(filename => !/^(\.|_)/.test(filename))
      .map(async (filename) => {
        const command = filename.slice(0, -3)
        const { stdout } = await execa.shell(`${CLI_PATH} ${command} --help`)
        const helpText = stdout
          .split('\n')
          // first and last lines are empty
          .slice(1, -1)
          // un-indent
          .map(line => line.slice(2))
          .join('\n')

        return `### ${pkgJson.name} ${command}\n\n\`\`\`\n${helpText}\n\`\`\``
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
