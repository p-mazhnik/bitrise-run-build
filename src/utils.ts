export const sleep = async (delay: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, delay))

export const urlsReferTheSameGitHubRepo = (url1: string, url2?: string) => {
  return (
    url1.replace('https://github.com/', 'git@github.com:') ===
    url2?.replace('https://github.com/', 'git@github.com:')
  )
}
