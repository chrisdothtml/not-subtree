// returns Array of filepaths
function parseGitStatusFiles (input) {
  return input.split('\n')
    .filter(Boolean)
    .map(line => (
      line
        .slice(3)
        // TODO: don't do /* for dirs, resolve full paths (perf)
        .replace(/\/$/, '/*')
    ))
}

module.exports = {
  parseGitStatusFiles
}
