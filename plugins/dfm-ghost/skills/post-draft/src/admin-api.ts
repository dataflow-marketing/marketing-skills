// Where the Ghost Admin API is on a site and the version of it post-draft is written for.

export const ACCEPT_VERSION = "v5.0";

// New posts are sent as HTML: Ghost turns the HTML into its own editor format.
export function postsUrl(address: string): string {
  return `${address}/ghost/api/admin/posts/?source=html`;
}

export function postUrl(address: string, id: string): string {
  return `${address}/ghost/api/admin/posts/${encodeURIComponent(id)}/`;
}

// Where a person opens the draft in Ghost Admin to read it and publish it.
export function editorUrl(address: string, id: string): string {
  return `${address}/ghost/#/editor/post/${encodeURIComponent(id)}`;
}
