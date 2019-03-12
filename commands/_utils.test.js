const test = require('tape-promise/tape')
const {
  parseGitStatusFiles,
  pathExists,
  shell
} = require('./_utils.js')

test('parseGitStatusFiles', async (t) => {
  const input = ` D foo
?? bar
 A baz
AM qux`
  const expected = [
    { action: 'remove', path: 'foo' },
    { action: 'copy', path: 'bar' },
    { action: 'copy', path: 'baz' },
    { action: 'copy', path: 'qux' }
  ]

  t.deepEqual(parseGitStatusFiles(input), expected)
})

test('pathExists', async (t) => {
  t.ok(pathExists(__filename))
  t.notOk(pathExists('some/path/that/doesnt/exist'))
})

test('shell', async (t) => {
  const { stdout } = await shell([
    'echo foo',
    false && 'echo bar',
    'echo baz'
  ])

  t.ok(stdout.includes('foo'))
  t.notOk(stdout.includes('bar'))
  t.ok(stdout.includes('baz'))
})
