import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { copyFileSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

const directory = mkdtempSync(join(tmpdir(), 'bitrise-bundle-'))

try {
  const entrypoint = join(directory, 'index.js')
  copyFileSync(resolve('dist/index.js'), entrypoint)

  const result = spawnSync(process.execPath, [entrypoint], {
    cwd: directory,
    encoding: 'utf8',
    timeout: 10_000,
    env: {
      ...process.env,
      INPUT_LISTEN: 'true',
      'INPUT_BITRISE-TOKEN': '',
      'INPUT_BITRISE-BUILD-TRIGGER-TOKEN': ''
    }
  })

  assert.ifError(result.error)
  assert.equal(result.status, 1, result.stdout + result.stderr)
  assert.match(
    result.stdout,
    /'bitrise-token' is required when 'listen: true'/,
    result.stdout + result.stderr
  )
  console.log(
    'Bundle starts without node_modules and validates missing credentials.'
  )
} finally {
  rmSync(directory, { recursive: true, force: true })
}
