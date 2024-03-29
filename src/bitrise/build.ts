import pickBy from 'lodash/pickBy'
import negate from 'lodash/negate'
import isNil from 'lodash/isNil'
import type {
  AbortOptions,
  AbortResponse,
  BuildOptions,
  BuildDescription,
  TriggeredBuildDetails
} from './types'
import type { AxiosInstance } from 'axios'

export const abortBuild = async (
  client: AxiosInstance,
  appSlug: string,
  buildSlug: string,
  options: AbortOptions = {}
) => {
  const params = pickBy(
    {
      abort_reason: options.reason,
      abort_with_success: options.withSuccess,
      skip_notifications: options.skipNotifications
    },
    negate(isNil)
  )
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
  options: BuildOptions,
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
