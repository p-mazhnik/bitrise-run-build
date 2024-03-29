import * as core from '@actions/core'
import { createClient } from './bitrise/client'
import { abortBuild, triggerBuild } from './bitrise/build'
import type { AxiosInstance } from 'axios'
import { createBuildOptions, getActorUsername } from './bitrise/options'
import { waitForBuildEndTime } from './listen'

export async function run() {
  const bitriseToken = core.getInput('bitrise-token', { required: true })
  const client = createClient({ token: bitriseToken })

  const bitriseAppId = core.getInput('bitrise-app-slug', { required: true })

  // Start the build
  const options = createBuildOptions()
  const actor = getActorUsername()
  try {
    const build = await triggerBuild(client, bitriseAppId, options, actor)

    core.info(`Build URL: ${build.build_url}`)
    core.setOutput('bitrise-build-id', build.build_slug)
    core.setOutput('bitrise-build-url', build.build_url)

    const shouldListen = core.getBooleanInput('listen', { required: false })
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
