import assert from 'assert'
import axios from 'axios'
import type { AxiosInstance } from 'axios'
import axiosRetry, { exponentialDelay } from 'axios-retry'

export const createClient = ({ token }: { token: string }): AxiosInstance => {
  assert(token, 'A build token is required')

  const client = axios.create({
    baseURL: 'https://api.bitrise.io/v0.1',
    headers: { Authorization: token }
  })

  axiosRetry(client, { retryDelay: exponentialDelay })
  return client
}

// export const buildTrigger = ({
//   token,
//   appSlug
// }: {
//   token: string
//   appSlug: string
// }): AxiosInstance => {
//   assert(token, 'A build token is required')
//
//   const client = axios.create({
//     baseURL: `https://app.bitrise.io/app/${appSlug}/build/start.json`,
//     headers: { 'Api-Token': token }
//   })
//
//   axiosRetry(client, { retryDelay: exponentialDelay })
//   return client
// }
