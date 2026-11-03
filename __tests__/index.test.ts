import { describe, expect, it, vi } from 'vitest'
import { run } from '../src/build'

vi.mock('../src/build', () => ({ run: vi.fn() }))

describe('index', () => {
  it('calls run when imported', async () => {
    await import('../src/index.js')

    expect(run).toHaveBeenCalledExactlyOnceWith()
  })
})
