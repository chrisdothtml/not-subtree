const execa = require('execa')
const fs = require('fs')

// returns Array of { action: 'copy|remove', path: '' }
function parseGitStatusFiles (input) {
  return input.split('\n')
    .filter(Boolean)
    .map(line => {
      const action = /^ D /.test(line) ? 'remove' : 'copy'
      const path = line.slice(3)

      return { action, path }
    })
}

function pathExists (path) {
  try {
    fs.accessSync(path)
    return true
  } catch (e) {
    return false
  }
}

// run a series of commands in the same spawned shell process;
// filters falsy array elements (for inline conditional commands)
async function shell (commands) {
  return execa.shell(
    commands.filter(Boolean).join(' && ')
  )
}

module.exports = {
  parseGitStatusFiles,
  pathExists,
  shell
}
