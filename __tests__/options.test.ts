import { context } from '@actions/github'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createBuildOptions, getActorUsername } from '../src/bitrise/options'

const originalContext = {
  payload: context.payload,
  eventName: context.eventName,
  ref: context.ref,
  sha: context.sha
}

beforeEach(() => {
  Object.assign(context, {
    eventName: 'push',
    ref: 'refs/heads/main',
    sha: 'test-commit',
    payload: {
      repository: {
        name: 'repo',
        owner: { login: 'owner' },
        clone_url: 'https://github.com/owner/repo.git'
      },
      head_commit: { message: 'Test commit' },
      pusher: { name: 'push-user' }
    }
  })
  for (const [name, value] of Object.entries({
    'INPUT_BITRISE-WORKFLOW': ' primary ',
    'INPUT_BITRISE-PIPELINE': '',
    INPUT_LISTEN: 'false',
    'INPUT_SKIP-GIT-STATUS-REPORT': 'false',
    'INPUT_BRANCH-OVERRIDE': '',
    'INPUT_COMMIT-OVERRIDE': '',
    'INPUT_ENV-VARS-FOR-BITRISE': 'TEST_PASSTHROUGH',
    TEST_PASSTHROUGH: 'test-value'
  })) {
    vi.stubEnv(name, value)
  }
})

afterEach(() => {
  Object.assign(context, originalContext)
  vi.unstubAllEnvs()
})

describe('Actions toolkit integration', () => {
  it('reads workflow inputs and push context through the real toolkit', () => {
    expect(createBuildOptions(null)).toMatchObject({
      workflow_id: 'primary',
      pipeline_id: undefined,
      branch: 'main',
      commit_hash: 'test-commit',
      base_repository_url: 'https://github.com/owner/repo.git',
      skip_git_status_report: false,
      environments: [
        { mapped_to: 'TEST_PASSTHROUGH', value: 'test-value', is_expand: false }
      ]
    })
    expect(getActorUsername()).toBe('push-user')
  })

  it('reads pipeline inputs and boolean status-report settings', () => {
    vi.stubEnv('INPUT_BITRISE-WORKFLOW', '')
    vi.stubEnv('INPUT_BITRISE-PIPELINE', 'primary-pipeline')
    vi.stubEnv('INPUT_SKIP-GIT-STATUS-REPORT', 'true')

    expect(createBuildOptions(null)).toMatchObject({
      workflow_id: undefined,
      pipeline_id: 'primary-pipeline',
      skip_git_status_report: true
    })
  })
})
