## Bitrise Build Runner for GitHub Actions

This action runs a [Bitrise][bitrise] build as a step in a GitHub Actions
workflow job.

The action starts the Bitrise workflow, optionally collects the logs and prints
them as they are written. If the GitHub job is canceled, the Bitrise workflow
build will also be canceled. The user experience is the same as it would be if
the logic were executed in the GitHub Actions job runner.

## Usage

### Inputs

This action offers following inputs that you can use to configure its behavior.

1. **bitrise-app-slug** (required) : A unique ID of Bitrise application. To find
   the slug:

   - Open Bitrise CI and select your project.
   - Once on the project's page, go to your browser's address bar.  
     The URL will look like this:
     `https://app.bitrise.io/app/7ca800ec-5cb7-478f-8ef1-c0ad4886f5bd`.
   - Find the hexadecimal number after the `/app/` section of the URL. That is
     your project's slug.

   [Source doc][bitrise-app-slug-doc]

1. **bitrise-workflow** (required) : The name of Bitrise workflow you want to
   run.

1. **listen** (optional) : Stream the logs as the build is happening on Bitrise
   and wait for build completion. Defaults to `false`, meaning that action will
   only trigger the build.

1. **bitrise-token** (required if `listen` is `true` or
   `bitrise-build-trigger-token` is not provided) : User-generated [personal
   access token][bitrise-pat] or [Workspace API
   token][bitrise-workspace-token].  
   Make sure token has correct permissions to run builds and view their logs.

1. **bitrise-build-trigger-token** (required if `bitrise-token` is not provided
   and `listen` is `false`) : Bitrise Build trigger token. To find the token:

   - Open your app on Bitrise.
   - On the main page of the app, click on the App Settings icon
   - Select **Integrations**
   - On the top of the Integrations page, select the **Webhooks** tab
   - Token is located in the **Build trigger API** section.

   If both `bitrise-token` and `bitrise-build-trigger-token` are specified,
   `bitrise-token` takes priority.

1. **update-interval** (optional) :  
   Applicable only when `listen` is set to `true`.  
   Update interval as seconds for how often the API is called to check on the
   status.

   A higher value mitigates the chance of hitting API rate-limiting especially
   when running many instances of this action in parallel, but also introduces a
   larger potential time overhead (ranging from 0 to update interval) for the
   action to fetch the build result and finish.

   Lower value limits the potential time overhead worst case but it may hit the
   API rate-limit more often, depending on the use-case.

   The default value is `15`.

1. **env-vars-for-bitrise** (optional) : A comma-separated list of the names of
   environment variables that the action passes from GitHub Actions to Bitrise.

   This list is often the same or a subset of the list of environment variables
   that you define for GitHub actions in the `env` property.

   Note: These additional variables will be handled with priority between
   `Secrets` and `App Env Vars`, which means that you can not overwrite
   Environment Variables defined in your build configuration (for example,
   `App Env Vars`), only `Secrets`.

1. **stop-on-signals** (optional) : Comma-separated list of signals that will
   cause any started builds to be stopped. The default value is `SIGINT`, which
   is what GitHub sends processes when a workflow is cancelled. This means you
   can use concurrency settings or other GitHub features that cause workflow
   cancellations without leaving orphan builds running. Set to an empty string
   to disable.

1. **skip-git-status-report** (optional) : If you have a webhook set up, Bitrise
   will send status reports to GitHub about your builds. If this field is set to
   `true`, no build status report will be sent.  
   Defaults to `false`.

1. **repository-override** (optional) :  
   By default, this action retrieves branch, commit and repo information from
   the current github context. In some cases, it is to launch workflow for the
   different commit and branch.  
   `repository-override` can be used if workflow is associated with another
   repository. It should match `Repository URL` from Bitrise App settings, and
   can't be used to change repository associated with workflow.

1. **branch-override** (optional) : By default, this action retrieves branch,
   commit and repo information from the current github context. In some cases,
   it is needed to launch workflow for the different commit and branch, as well
   as workflows associated with another repository.  
   `branch-override` overrides branch provided to Bitrise. If specified, Bitrise
   will use the head commit for this branch, unless `commit-override` is
   provided.

1. **commit-override** (optional) : If specified, tells Bitrise to use this
   commit hash for the build.

By default, regardless of the project configuration in Bitrise or GitHub
Actions, the following parameters and values are always passed to Bitrise in the
API call.

| Bitrise value | GitHub value                                             | Bitrise default                               |
| ------------- | -------------------------------------------------------- | --------------------------------------------- |
| `commit_hash` | The commit that triggered the workflow                   | Head commit of the default / specified branch |
| `branch`      | Current branch: `context.ref` or `pull_request.head.ref` | `Default branch` from Bitrise App settings    |

Use `commit-override` and `branch-override` to override the values above.

Note that Bitrise uses `Repository URL` from Bitrise App settings as the current
repo. To change repository used in workflow steps (and other properties), you
can override Bitrise default envs (like `GIT_REPOSITORY_URL`) using
`env-vars-for-bitrise` option.

### Outputs

1. **bitrise-build-id** : The Bitrise build ID of the build that the action ran.
1. **bitrise-build-url** : The Bitrise Build url for the build.

### Examples

These examples show how you can define a step in a workflow job. For more
information about GitHub Actions workflow syntax, see the [GitHub
docs][github workflow syntax].

```yaml
- name: Run Bitrise build
  uses: p-mazhnik/bitrise-run-build@v1
  with:
    bitrise-app-slug: bitrise-app-id
    bitrise-token: ${{ secrets.BITRISE_TOKEN }}
    bitrise-workflow: primary
    listen: true
```

The following example demonstrates how to trigger Bitrise build without waiting
for logs and result:

```yaml
- name: Trigger Bitrise build
  uses: p-mazhnik/bitrise-run-build@v1
  with:
    bitrise-app-slug: bitrise-app-id
    bitrise-build-trigger-token: ${{ secrets.BITRISE_BUILD_TOKEN }}
    # alternatively, provide 'bitrise-token':
    # bitrise-token: ${{ secrets.BITRISE_TOKEN }}
    bitrise-workflow: primary
    listen: false
```

The following configuration tells action to send all the environment variables
defined in the `env:` list to Bitrise.

```yaml
- name: Run Bitrise build
  uses: p-mazhnik/bitrise-run-build@v1
  with:
    bitrise-app-slug: bitrise-app-id
    bitrise-workflow: primary
    listen: false
    bitrise-build-trigger-token: ${{ secrets.BITRISE_BUILD_TOKEN }}
    env-vars-for-bitrise: |
      CUSTOM,
      GIT_REPOSITORY_URL
  env:
    CUSTOM: my environment variable
    GIT_REPOSITORY_URL: git@github.com:p-mazhnik/repo.git # tell Clone step to use different repo
```

To run Bitrise workflow associated with another repo:

```yaml
- name: Run Bitrise workflow associated with another repo
  uses: p-mazhnik/bitrise-run-build@v1
  with:
    bitrise-app-slug: bitrise-app-id-2
    bitrise-workflow: primary
    listen: false
    bitrise-token: ${{ secrets.BITRISE_TOKEN }}
    branch-override: dev
```

## Implementation Notes

[Bitrise API][bitrise-api] is used to trigger the workflow.

If `listen` is `true`, the action waits for the build to complete while logging
everything written to the build's logs. If the `status` value in the Build
details response is `1`, the action succeeds. Otherwise, it fails.

## Credits

This action was inspired by the following projects:

- [AWS CodeBuild Run Build for GitHub Actions](https://github.com/aws-actions/aws-codebuild-run-build/)
- [Bitrise JS client](https://github.com/lifeomic/bitrise/)
- [Bitrise Webhooks](https://github.com/bitrise-io/bitrise-webhooks/)

## License

This software is available as open source under the terms of the MIT License. A
copy of this license is included in the [LICENSE][license] file.

[bitrise]: https://bitrise.io/
[bitrise-pat]:
  https://devcenter.bitrise.io/en/accounts/personal-access-tokens.html#creating-a-personal-access-token
[bitrise-app-slug-doc]:
  https://devcenter.bitrise.io/en/api/identifying-workspaces-and-apps-with-their-slugs.html#finding-a-slug-on-the-bitrise-website
[bitrise-workspace-token]:
  https://devcenter.bitrise.io/en/workspaces/workspace-api-token.html#creating-a-workspace-api-token
[bitrise-api]: https://devcenter.bitrise.io/en/api.html
[github workflow syntax]:
  https://help.github.com/en/actions/automating-your-workflow-with-github-actions/workflow-syntax-for-github-actions
[license]: ./LICENSE
