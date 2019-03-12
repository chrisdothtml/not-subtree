const execa = require('execa')
const { pathExists } = require('./_utils.js')

async function add (argv) {
  if (pathExists(argv.path)) {
    console.error(`Error: path already exists: ${argv.path}`)
  } else {
    await execa.shell([
      `git clone ${argv.remote} -b ${argv.branch || 'master'} ${argv.path}`,
      `rm -rf ${argv.path}/.git`,
      `git add '${argv.path}/*'`,
      `git commit -m "${argv.message || `Add '${argv.path}' tree`}"`
    ].join(' && '))
  }
}

module.exports = (cli) => {
  cli
    .command('add')
    .describe('Add new subtree from an external repo')
    .option('-p, --path', '[required] Sub-path to add new subtree to')
    .option('-r, --remote', '[required] External repo git remote url')
    .option('-b, --branch', 'External repo branch to use')
    .option('-m, --message', 'Commit message')
    .example('add -p bar -r git@github.com:foo/bar.git')
    .action((argv) => {
      if (!argv.path || !argv.remote) {
        console.error('Error: missing required args')
        cli.help('add')
      } else {
        add(argv).catch(console.error)
      }
    })
}
