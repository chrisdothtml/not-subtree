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

module.exports = {
  parseGitStatusFiles
}
