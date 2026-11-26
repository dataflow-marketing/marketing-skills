// The Ghost Admin API calls the ghost connector makes: where they go, their headers and the body of a change.
// Member custom fields came in a Ghost newer than 6.58: an older Ghost has no fields list to read.

export type Fetch = (url: string, init: RequestInit) => Promise<Response>;

export const ACCEPT_VERSION = "v6.0";

export function headersFor(token: string, sending = false): Record<string, string> {
  const headers: Record<string, string> = { Authorization: `Ghost ${token}`, "Accept-Version": ACCEPT_VERSION };
  if (sending) {
    headers["Content-Type"] = "application/json";
  }
  return headers;
}

// The custom fields the site has
export function fieldsUrl(address: string): string {
  return `${address}/ghost/api/admin/members/metafields/custom/`;
}

// Every member with this email, with their fields; two are asked for so a second one shows
export function membersByEmailUrl(address: string, email: string): string {
  const filter = encodeURIComponent(`email:'${email.replace(/'/g, "\\'")}'`);
  return `${address}/ghost/api/admin/members/?filter=${filter}&include=metafields&limit=2`;
}

export function memberUrl(address: string, id: string): string {
  return `${address}/ghost/api/admin/members/${encodeURIComponent(id)}/?include=metafields`;
}

// A change sends the one field only: every other field and the rest of the member are left as they are.
// An empty object is sent as null, which clears the field.
export function changeBody(field: string, text: string): string {
  return JSON.stringify({ members: [{ metafields: { custom: { [field]: text === "" ? null : text } } }] });
}

// A field's text as a member record holds it: a missing or null field is empty
export function fieldText(member: unknown, field: string): string {
  const custom = (member as { metafields?: { custom?: Record<string, unknown> } }).metafields?.custom;
  const value = custom?.[field];
  return typeof value === "string" ? value : "";
}
