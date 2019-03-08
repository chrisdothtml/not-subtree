const execa = require('execa')
const { parseGitStatusFiles } = require('./_utils.js')

// required args: path, remote, head-branch
// optional args: base-branch (d: master)
// TODO: log when no changes to pull
module.exports = async function pull (argv) {
  const baseBranch = argv.baseBranch || 'master'

  const { stdout } = await execa.shell([
    // TODO: use os.tmpdir() instead
    `git clone ${argv.remote} -b ${baseBranch} __temp__`,
    `cd __temp__`,
    `git checkout ${argv.headBranch}`,
    `git reset --mixed ${baseBranch}`,
    `echo "\n\nGIT_STATUS:$(git status -s)"`
  ].join(' && '))

  const filesToCopy = parseGitStatusFiles(stdout.split('GIT_STATUS:')[1])
    .join(' ')

  return execa.shell([
    `cd __temp__`,
    `cp -R ${filesToCopy} ../${argv.path}`,
    `cd ..`,
    `rm -rf __temp__`,
    `git add '${argv.path}/*'`,
    `git commit -m "${argv.message || `Pull '${argv.path}' tree`}"`
  ].join(' && '))
}
