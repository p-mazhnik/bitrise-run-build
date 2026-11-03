import type { AxiosInstance } from 'axios'
import { create } from 'axios'
import axiosRetry, { exponentialDelay } from 'axios-retry'

export const createClient = ({ token }: { token: string }): AxiosInstance => {
  const client = create({
    baseURL: 'https://api.bitrise.io/v0.1',
    headers: { Authorization: token }
  })

  axiosRetry(client, { retryDelay: exponentialDelay })
  return client
}
