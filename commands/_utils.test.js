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
  const { stdout: stringStdout } = await shell('echo foo')
  const { stdout: arrayStdout } = await shell([
    'echo foo',
    false && 'echo bar',
    'echo baz'
  ])

  t.ok(stringStdout.includes('foo'))
  t.ok(arrayStdout.includes('foo'))
  t.notOk(arrayStdout.includes('bar'))
  t.ok(arrayStdout.includes('baz'))
})
