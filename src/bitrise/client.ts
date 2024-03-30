import axios from 'axios'
import type { AxiosInstance } from 'axios'
import axiosRetry, { exponentialDelay } from 'axios-retry'

export const createClient = ({ token }: { token: string }): AxiosInstance => {
  const client = axios.create({
    baseURL: 'https://api.bitrise.io/v0.1',
    headers: { Authorization: token }
  })

  axiosRetry(client, { retryDelay: exponentialDelay })
  return client
}
