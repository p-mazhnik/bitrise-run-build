import * as core from '@actions/core'
import { createClient } from './bitrise/client'
import {
  abortBuild,
  triggerBuildWithBuildToken,
  triggerBuild
} from './bitrise/build'
import type { AxiosInstance } from 'axios'
import { createBuildOptions, getActorUsername } from './bitrise/options'
import { waitForBuildEndTime } from './listen'
import type { BitriseAppDetails, TriggeredBuildDetails } from './bitrise/types'
import { getAppDetails } from './bitrise/app'

export async function run() {
  const shouldListen = core.getBooleanInput('listen', { required: false })
  const bitriseToken = core.getInput('bitrise-token', { required: false })
  const bitriseBuildTriggerToken = core.getInput(
    'bitrise-build-trigger-token',
    { required: false }
  )
  if (shouldListen && !bitriseToken) {
    core.setFailed("'bitrise-token' is required when 'listen: true'")
    return
  }

  const client = createClient({ token: bitriseToken })

  const bitriseAppId = core.getInput('bitrise-app-slug', { required: true })
  let appDetails: BitriseAppDetails | null = null
  try {
    if (bitriseToken) {
      appDetails = await getAppDetails(client, bitriseAppId)
    }
  } catch (e) {
    core.setFailed(e as Error)
  }
  // Start the build
  const options = createBuildOptions(appDetails)
  const actor = getActorUsername()
  try {
    let build: TriggeredBuildDetails
    if (bitriseToken) {
      build = await triggerBuild(client, bitriseAppId, options, actor)
    } else if (bitriseBuildTriggerToken) {
      build = await triggerBuildWithBuildToken(
        bitriseBuildTriggerToken,
        bitriseAppId,
        options,
        actor
      )
    } else {
      core.setFailed(
        "Either 'bitrise-token' or 'bitrise-build-trigger-token' required"
      )
      return
    }

    core.info(`Build URL: ${build.build_url}`)
    core.setOutput('bitrise-build-id', build.build_slug)
    core.setOutput('bitrise-build-url', build.build_url)

    if (!shouldListen) {
      return
    }

    const stopOnSignals = core
      .getInput('stop-on-signals', { required: false })
      .split(',')
      .map(i => i.trim())
      .filter(i => i !== '')

    // Set up signal handling to stop the build on cancellation
    setupSignalHandlers(client, bitriseAppId, build.build_slug, stopOnSignals)

    const updateInterval =
      parseInt(core.getInput('update-interval', { required: false }), 10) * 1000

    // Wait for the build to "complete"
    await waitForBuildEndTime(client, bitriseAppId, build.build_slug, {
      updateInterval
    })
  } catch (e) {
    core.setFailed(e as Error)
  }
}

function setupSignalHandlers(
  client: AxiosInstance,
  appSlug: string,
  buildSlug: string,
  signals: string[]
) {
  for (const s of signals) {
    core.info(`Installing signal handler for ${s}`)
    process.on(s, async () => {
      try {
        core.info(`Caught ${s}, attempting to stop build...`)
        await abortBuild(client, appSlug, buildSlug, { reason: `Caught ${s}` })
      } catch (ex) {
        core.error(`Error stopping build: ${ex}`)
      }
    })
  }
}
