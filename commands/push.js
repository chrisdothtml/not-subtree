const execa = require('execa')
const { parseGitStatusFiles } = require('./_utils.js')

// TODO: log when no changes to push
async function push (argv) {
  const { stdout: currentBranch } = await execa.shell(`git branch | grep \\* | cut -d ' ' -f2`)
  const baseBranch = argv.baseBranch || 'master'
  const remoteBranch = argv.remoteBranch || currentBranch

  const { stdout } = await execa.shell([
    `git checkout -b __temp__`,
    // TODO: ensure baseBranch is available locally
    `git reset --mixed ${baseBranch}`,
    `echo "\n\nGIT_STATUS:$(git status -s)"`
  ].join(' && '))

  const filesToCopy = parseGitStatusFiles(stdout.split('GIT_STATUS:')[1])
    .filter(filepath => filepath.startsWith(argv.path))
    .join(' ')

  return execa.shell([
    // TODO: use os.tmpdir() instead
    `git clone ${argv.remote} -b ${remoteBranch} __temp__`,
    `cp -R ${filesToCopy} __temp__`,
    `cd __temp__`,
    `git add .`,
    `git commit -m "${argv.message || 'Update tree'}"`,
    `git push`,
    `cd ..`,
    `rm -rf __temp__`,
    `git checkout .`,
    `git checkout ${currentBranch}`,
    `git branch -D __temp__`
  ].join(' && '))
}

module.exports = (cli) => {
  cli
    .command('push')
    .describe(`Push changed files between --base-branch and current branch into --remote-branch of external repo`)
    .option('-p, --path', '[required] Sub-path to pull subtree into')
    .option('-r, --remote', '[required] External repo git remote url')
    .option('--base-branch', '(default: master)')
    .option('--remote-branch', '(default: current branch name)')
    .option('-m, --message', 'Commit message')
    .example('push -p bar -r git@github.com:foo/bar.git')
    .example('push -p bar -r git@github.com:foo/bar.git --remote-branch develop')
    .action(argv => {
      if (!argv.path || !argv.remote) {
        console.error('Error: missing required args')
        cli.help('push')
      } else {
        push(argv).catch(console.error)
      }
    })
}
