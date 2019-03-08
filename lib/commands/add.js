const execa = require('execa')

// required args: path, remote
// optional args: branch, message
// TODO: error if path exists
module.exports = async function add (argv) {
  return execa.shell([
    `git clone ${argv.remote} -b ${argv.branch || 'master'} ${argv.path}`,
    `rm -rf ${argv.path}/.git`,
    `git add '${argv.path}/*'`,
    `git commit -m "${argv.message || `Add '${argv.path}' tree`}"`
  ].join(' && '))
}
