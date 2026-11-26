// What profile-make says when a site has no /llms-full.txt. It never reads the site another way on its own:
// the person is asked whether to read the pages its sitemap lists instead.

export function noLlmsFull(llmsFullUrl: string, problem: string): string {
  return [
    `There is no ${llmsFullUrl} (${problem}).`,
    "Some site builders can make one: on Ghost it is on unless the site is private or the setting is off.",
    "Otherwise profile-make can read the pages the site's sitemap lists instead.",
    "Ask the person which; to read the sitemap, run this again with --from-sitemap.",
  ].join("\n");
}
