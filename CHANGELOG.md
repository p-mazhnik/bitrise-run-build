# Changelog

## v2.0.0

### Breaking changes

- Run the action on Node 24 instead of Node 20
  ([#32](https://github.com/p-mazhnik/bitrise-run-build/pull/32)). Self-hosted
  runners require Actions Runner v2.327.1 or newer and an operating system that
  supports Node 24.

### Updates

- Update runtime dependencies: `@actions/core` 1.10.1 → 3.0.1, `@actions/github`
  6.0.0 → 9.1.1, Axios 1.6.8 → 1.21.0, and axios-retry 4.1.0 → 4.5.0
  ([#33](https://github.com/p-mazhnik/bitrise-run-build/pull/33),
  [#36](https://github.com/p-mazhnik/bitrise-run-build/pull/36)).
- Replace ncc with esbuild to bundle the action and support ESM-only runtime
  dependencies ([#36](https://github.com/p-mazhnik/bitrise-run-build/pull/36)).

## v1.2.0

### Enhancements

- Support Bitrise pipelines
  [#29](https://github.com/p-mazhnik/bitrise-run-build/pull/29)

### Fixes

- Cleanup attempt number if request is successful

## v1.1.1

- Retry logs fetching in case of network errors

## v1.1.0

- Support overriding branch and commit

## v1.0.0

Initial release
