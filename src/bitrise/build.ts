import type {
  AbortOptions,
  AbortResponse,
  BitriseBuildOptions,
  BuildDescription,
  TriggeredBuildDetails
} from './types'
import type { AxiosInstance } from 'axios'
import axios from 'axios'

export const abortBuild = async (
  client: AxiosInstance,
  appSlug: string,
  buildSlug: string,
  options: AbortOptions = {}
) => {
  const params = {
    abort_reason: options.reason,
    abort_with_success: options.withSuccess,
    skip_notifications: options.skipNotifications
  }
  await client.post<AbortResponse>(
    `/apps/${appSlug}/builds/${buildSlug}/abort`,
    params
  )
}

export const describeBuild = async (
  client: AxiosInstance,
  appSlug: string,
  buildSlug: string
): Promise<BuildDescription> => {
  const response = await client.get<{ data: BuildDescription }>(
    `/apps/${appSlug}/builds/${buildSlug}`
  )
  return response.data.data
}

export const triggerBuild = async (
  client: AxiosInstance,
  appSlug: string,
  options: BitriseBuildOptions,
  actor: string
): Promise<TriggeredBuildDetails> => {
  const buildOptions = {
    build_params: options,
    hook_info: { type: 'bitrise' },
    triggered_by: `actions-github/${actor}`
  }

  const response = await client.post<TriggeredBuildDetails>(
    `/apps/${appSlug}/builds`,
    buildOptions
  )
  return response.data
}

export const triggerBuildWithBuildToken = async (
  buildToken: string,
  appSlug: string,
  options: BitriseBuildOptions,
  actor: string
): Promise<TriggeredBuildDetails> => {
  const buildOptions = {
    build_params: options,
    hook_info: { type: 'bitrise' },
    triggered_by: `actions-github/${actor}`
  }
  const response = await axios.post<TriggeredBuildDetails>(
    `/app/${appSlug}/build/start.json`,
    buildOptions,
    {
      baseURL: `https://app.bitrise.io`,
      headers: {
        'Api-Token': buildToken,
        'X-Bitrise-Event': 'hook',
        'Content-Type': 'application/json'
      }
    }
  )

  return response.data
}
