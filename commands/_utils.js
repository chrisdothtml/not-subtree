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

module.exports = {
  parseGitStatusFiles
}
