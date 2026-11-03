import { readFileSync } from 'node:fs'
import { build, context } from 'esbuild'

const nodeMajor = readFileSync(
  new URL('../.node-version', import.meta.url),
  'utf8'
)
  .trim()
  .split('.')[0]
const args = process.argv.slice(2)
const options = {
  entryPoints: ['src/index.ts'],
  bundle: true,
  platform: 'node',
  target: `node${nodeMajor}`,
  format: 'cjs',
  legalComments: 'eof',
  outfile: 'dist/index.js',
  sourcemap: args.includes('--sourcemap'),
  logLevel: 'info'
}

if (args.includes('--watch')) {
  const watcher = await context(options)
  await watcher.watch()
} else {
  await build(options)
}
