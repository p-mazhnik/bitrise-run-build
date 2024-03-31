import type { AxiosInstance } from 'axios'
import type { BitriseAppDetails } from './types'

export const getAppDetails = async (
  client: AxiosInstance,
  appSlug: string
): Promise<BitriseAppDetails> => {
  const response = await client.get<{ data: BitriseAppDetails }>(
    `/apps/${appSlug}`
  )
  return response.data.data
}
