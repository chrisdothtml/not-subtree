const execa = require('execa')
const { parseGitStatusFiles } = require('./_utils.js')

// required args: remote, path
// optional args: base-branch (d: master), remote-branch (d: current local branch)
// TODO: log when no changes to push
module.exports = async function push (argv) {
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
