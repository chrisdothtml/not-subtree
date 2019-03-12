const execa = require('execa')
const { parseGitStatusFiles } = require('./_utils.js')

async function push (argv) {
  const { stdout: currentBranch } = await execa.shell(`git branch | grep \\* | cut -d ' ' -f2`)
  const baseBranch = argv.baseBranch || 'master'
  const remoteBranch = argv.remoteBranch || currentBranch

  const { stdout } = await execa.shell([
    `git checkout -b __temp__`,
    // ensure base branch exists locally
    `git checkout ${baseBranch}`,
    `git checkout __temp__`,
    `git reset --mixed ${baseBranch}`,
    `echo "GIT_STATUS:$(git status -s)"`
  ].join(' && '))

  const changedFiles = parseGitStatusFiles(stdout.split('GIT_STATUS:')[1])
    .filter(file => file.path.startsWith(argv.path))

  if (changedFiles.length) {
    const filesToCopy = changedFiles
      .filter(file => file.action === 'copy')
      .map(file => file.path.replace(/\/$/, ''))
    const filesToRemove = changedFiles
      .filter(file => file.action === 'remove')
      .map(file => file.path.slice(argv.path.length + 1))

    const { stdout } = await execa.shell([
      `git clone ${argv.remote} -b ${remoteBranch} __temp__`,
      filesToCopy.length && `cp -R ${filesToCopy.join(' ')} __temp__`,
      `cd __temp__`,
      filesToRemove.length && `rm -rf ${filesToRemove.join(' ')}`,
      `echo "GIT_STATUS:$(git status -s)"`
    ].filter(Boolean).join(' && '))

    const diffFiles = parseGitStatusFiles(stdout.split('GIT_STATUS:')[1])

    if (diffFiles.length) {
      await execa.shell([
        `git add .`,
        `git commit -m "${argv.message || 'Update tree'}"`,
        `git push`
      ].join(' && '))
    } else {
      console.warn('Warning: no changes to push')
    }

    await execa.shell([
      `cd ..`,
      `rm -rf __temp__`
    ].join(' && '))
  } else {
    console.warn('Warning: no changes to push')
  }

  return execa.shell([
    `git checkout .`,
    `git clean -fd`,
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
