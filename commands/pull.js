const execa = require('execa')
const { parseGitStatusFiles } = require('./_utils.js')

// TODO: log when no changes to pull
async function pull (argv) {
  const baseBranch = argv.baseBranch || 'master'

  const { stdout } = await execa.shell([
    // TODO: use os.tmpdir() instead
    `git clone ${argv.remote} -b ${baseBranch} __temp__`,
    `cd __temp__`,
    `git checkout ${argv.headBranch}`,
    `git reset --mixed ${baseBranch}`,
    `echo "\n\nGIT_STATUS:$(git status -s)"`
  ].join(' && '))

  const gitStatusFiles = parseGitStatusFiles(stdout.split('GIT_STATUS:')[1])
  const filesToCopy = gitStatusFiles
    .filter(file => file.action === 'copy')
    .map(file => file.path.replace(/\/$/, ''))
  const filesToRemove = gitStatusFiles
    .filter(file => file.action === 'remove')
    .map(file => argv.path + '/' + file.path)

  return execa.shell([
    `cd __temp__`,
    filesToCopy.length && `cp -R ${filesToCopy.join(' ')} ../${argv.path}`,
    `cd ..`,
    filesToRemove.length && `rm -rf ${filesToRemove.join(' ')}`,
    `rm -rf __temp__`,
    `git add '${argv.path}/*'`,
    `git commit -m "${argv.message || `Pull '${argv.path}' tree`}"`
  ].filter(Boolean).join(' && '))
}

module.exports = (cli) => {
  cli
    .command('pull')
    .describe(`Pull external repo's changed files between --base-branch and --head-branch`)
    .option('-p, --path', '[required] Sub-path to pull subtree into')
    .option('-r, --remote', '[required] External repo git remote url')
    .option('--head-branch', '[required]')
    .option('--base-branch', '(default: master)')
    .option('-m, --message', 'Commit message')
    .example('pull -p bar -r git@github.com:foo/bar.git --head-branch feature/foo')
    .example('pull -p bar -r git@github.com:foo/bar.git --base-branch develop --head-branch feature/foo')
    .action(argv => {
      if (!argv.path || !argv.remote || !argv.headBranch) {
        console.error('Error: missing required args')
        cli.help('pull')
      } else {
        pull(argv).catch(console.error)
      }
    })
}
