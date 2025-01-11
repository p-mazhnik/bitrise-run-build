import { sleep } from './utils'
import * as core from '@actions/core'
import { describeBuild } from './bitrise/build'
import type { BuildLogResponse, BuildDescription } from './bitrise/types'
import type { AxiosInstance, AxiosResponse } from 'axios'
import { AxiosError } from 'axios'

export const waitForBuildEndTime = async (
  client: AxiosInstance,
  appSlug: string,
  buildSlug: string,
  { updateInterval }: { updateInterval: number }
) => {
  core.info(`Waiting for build ${appSlug}/${buildSlug} output...`)
  let count = 0
  const maxAttempts = 5
  let attemptNumber = 1
  let pollingLogs = true
  let buildInfo: BuildDescription | undefined
  let lastPosition = 0
  const interval = updateInterval
  do {
    if (interval > 0) {
      await sleep(interval)
    }

    let response: AxiosResponse<BuildLogResponse>

    try {
      buildInfo = await describeBuild(client, appSlug, buildSlug)

      if (
        buildInfo.is_on_hold ||
        !buildInfo.started_on_worker_at ||
        !pollingLogs
      ) {
        // build is not started yet
        // or need to skip logs polling
        continue
      }

      response = await client.get<BuildLogResponse>(
        `/apps/${appSlug}/builds/${buildSlug}/log`
      )
      // cleanup attempt number if request is successful
      attemptNumber = 1
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        core.info(error.response.data?.message)
      }
      if (attemptNumber >= maxAttempts) {
        throw error
      }
      attemptNumber++
      core.info(
        `Retrying to fetch logs, attempt #${attemptNumber} of ${maxAttempts}`
      )
      continue
    }

    ++count
    const logIsArchived = response.data.is_archived

    // If the log has already been archived then polling is no good. Just
    // download and print the log data. This handles the case where the
    // very first request finds an archived build
    if (logIsArchived && count === 1) {
      pollingLogs = false
      if (!response.data.expiring_raw_log_url) {
        // logs are missing
        continue
      }
      const archiveResponse = await client.get(
        response.data.expiring_raw_log_url
      )
      core.info(archiveResponse.data.trimEnd())
      continue
    }

    if (response.data.log_chunks.length) {
      for (const { chunk, position } of response.data.log_chunks) {
        // When requesting the logs by timestamps returned from previous
        // requests, duplicate chunks are included in the response. Only
        // log new chunks
        if (position > lastPosition) {
          core.info(chunk.trimEnd())
          lastPosition = position
        }
      }
    }
  } while (!buildInfo?.finished_at)

  if (buildInfo.status !== 1) {
    core.setFailed(getStatusMessage(buildInfo.status))
  } else {
    core.info(getStatusMessage(buildInfo.status))
  }
}

function getStatusMessage(status: number): string {
  switch (status) {
    case 0:
      return 'Build TIMED OUT'
    case 1:
      return 'Build Successful 🎉'
    case 2:
      return 'Build Failed 🚨'
    case 3:
      return 'Build Aborted 💥'
  }
  return 'Invalid build status 🤔'
}
