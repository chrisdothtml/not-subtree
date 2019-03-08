const path = require('path')
const camelCase = require('just-camel-case')
const execa = require('execa')
const commands = {
  // required args: path, remote
  // optional args: branch, message
  async add (argv) {
    return execa.shell([
      `git clone ${argv.remote} -b ${argv.branch || 'master'} ${argv.path}`,
      `rm -rf ${argv.path}/.git`,
      `git add '${argv.path}/*'`,
      `git commit -m "${argv.message || `Add '${argv.path}' tree`}"`
    ].join(' && '))
  },
  // required args: path, remote, head-branch
  // optional args: base-branch (d: master)
  async pull (argv) {
    const baseBranch = argv.baseBranch || 'master'

    const { stdout } = await execa.shell([
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
  },
  // required args: remote, path
  // optional args: base-branch (d: master), remote-branch (d: current local branch)
  async push (argv) {
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
}

// returns Array of filepaths
function parseGitStatusFiles (input) {
  return input.split('\n')
    .filter(Boolean)
    .map(line => (
      line
        .slice(3)
        .replace(/\/$/, '/*')
    ))
}

async function main () {
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
