/* eslint-disable @typescript-eslint/ban-types,@typescript-eslint/no-explicit-any */

export interface PageInfo {
  readonly next?: string
  readonly total_item_count: number
}

export interface AbortOptions {
  readonly reason?: string
  readonly withSuccess?: boolean
  readonly skipNotifications?: boolean
}

export interface AbortResponse {
  readonly status?: string
  readonly message?: string
}

export interface TriggeredBuildDetails {
  readonly build_number: number
  readonly build_slug: string
  readonly build_url: string
  readonly message: string
  readonly service: string
  readonly slug: string
  readonly status: string
  readonly triggered_workflow: string
}

export interface BuildDescription {
  readonly abort_reason: string
  readonly branch: string
  readonly build_number: number
  readonly commit_hash: string
  readonly commit_message: string
  readonly commit_view_url: string
  readonly environment_prepare_finished_at: string
  readonly finished_at: string
  readonly is_on_hold: boolean
  readonly original_build_params: string
  readonly pull_request_id: number
  readonly pull_request_target_branch: string
  readonly pull_request_view_url: string
  readonly slug: string
  readonly stack_config_type: string
  readonly stack_identifier: string
  readonly started_on_worker_at: string
  readonly status: number
  readonly status_text: string
  readonly tag: string
  readonly triggered_at: string
  readonly triggered_by: string
  readonly triggered_workflow: string
}

export interface ArtifactDescription {
  readonly artifact_meta: object
  readonly artifact_type: string
  readonly expiring_download_url: string
  readonly file_size_bytes: number
  readonly is_public_page_enabled: boolean
  readonly public_install_page_url: string
  readonly slug: string
  readonly title: string
}

export interface ListArtifactsOptions {
  readonly next?: string
  readonly limit?: number
}

export interface ArtifactList {
  readonly artifacts: ArtifactDescription[]
  readonly paging: PageInfo
}

export interface CommitPathsFilter {
  readonly added?: string[]
  readonly modified?: string[]
  readonly removed?: string[]
}

export interface BitriseBuildOptions extends Record<string, any> {
  branch_dest?: string
  branch_dest_repo_owner?: string
  branch_repo_owner?: string
  build_request_slug?: string
  commit_hash?: string
  commit_message?: string
  diff_url?: string
  pull_request_author?: string
  pull_request_head_branch?: string
  pull_request_id?: number
  pull_request_merge_branch?: string
  pull_request_repository_url?: string
  skip_git_status_report?: boolean
  tag?: string
  pull_request_ready_state?:
    | 'draft'
    | 'ready_for_review'
    | 'converted_to_ready_for_review'
  environments?: BitriseEnvironment[]
}

export interface BitriseEnvironment {
  mapped_to: string
  value: string
  is_expand: boolean
}

export interface BuildLogResponse {
  is_archived: boolean
  expiring_raw_log_url?: string
  log_chunks: {
    chunk: string
    position: number
  }[]
  next_before_timestamp: string
  next_after_timestamp: string
}
