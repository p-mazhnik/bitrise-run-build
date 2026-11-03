import type { AxiosAdapter, InternalAxiosRequestConfig } from 'axios'
import { AxiosError } from 'axios'
import { describe, expect, it, vi } from 'vitest'
import { createClient } from '../src/bitrise/client'

function unavailable(config: InternalAxiosRequestConfig): AxiosError {
  return new AxiosError(
    'Service unavailable',
    AxiosError.ERR_BAD_RESPONSE,
    config,
    undefined,
    {
      data: {},
      status: 503,
      statusText: 'Service Unavailable',
      headers: {},
      config
    }
  )
}

describe('Bitrise HTTP client', () => {
  it('retries a transient read failure and preserves authentication', async () => {
    const client = createClient({ token: 'test-token' })
    const adapter = vi
      .fn<AxiosAdapter>()
      .mockImplementationOnce(async config => {
        throw unavailable(config)
      })
      .mockImplementation(async config => ({
        data: { data: { slug: 'build-id' } },
        status: 200,
        statusText: 'OK',
        headers: {},
        config
      }))
    client.defaults.adapter = adapter

    const response = await client.get('/apps/app-id/builds/build-id')

    expect(response.data).toEqual({ data: { slug: 'build-id' } })
    expect(adapter).toHaveBeenCalledTimes(2)
    for (const [config] of adapter.mock.calls) {
      expect(config.headers.get('Authorization')).toBe('test-token')
      expect(client.getUri(config)).toBe(
        'https://api.bitrise.io/v0.1/apps/app-id/builds/build-id'
      )
    }
  })

  it('does not retry a failed build creation and risk starting duplicate builds', async () => {
    const client = createClient({ token: 'test-token' })
    const adapter = vi.fn<AxiosAdapter>().mockImplementation(async config => {
      throw unavailable(config)
    })
    client.defaults.adapter = adapter

    await expect(
      client.post('/apps/app-id/builds', { workflow_id: 'primary' })
    ).rejects.toMatchObject({ response: { status: 503 } })
    expect(adapter).toHaveBeenCalledTimes(1)
  })
})
