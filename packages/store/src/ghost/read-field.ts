// Reads one member's custom field from Ghost: the field must be on the site and the email must name exactly one
// member. The token goes in a header only; no answer from Ghost that could hold it is printed.

import { fieldText, fieldsUrl, headersFor, membersByEmailUrl } from "./member-calls.ts";
import type { Fetch } from "./member-calls.ts";

export type FieldRead = { ok: true; memberId: string; text: string } | { ok: false; problem: string };

export type FieldLookup = { address: string; email: string; field: string; token: string };

export async function readField(lookup: FieldLookup, fetch: Fetch): Promise<FieldRead> {
  const fields = await fieldsOnSite(lookup, fetch);
  if (!fields.ok) {
    return fields;
  }
  if (!fields.keys.includes(lookup.field)) {
    return { ok: false, problem: `The site has no member field called ${lookup.field}. Its fields: ${fields.keys.join(", ") || "none"}.` };
  }
  return oneMember(lookup, fetch);
}

async function fieldsOnSite(lookup: FieldLookup, fetch: Fetch): Promise<{ ok: true; keys: string[] } | { ok: false; problem: string }> {
  const response = await fetch(fieldsUrl(lookup.address), { method: "GET", headers: headersFor(lookup.token) });
  if (response.status === 404 || response.status === 406) {
    return { ok: false, problem: `${lookup.address} has no member custom fields: they need a newer Ghost than this site runs.` };
  }
  if (!response.ok) {
    return { ok: false, problem: `Ghost answered ${response.status} when asked for its member fields.` };
  }
  const body = (await response.json()) as { members_metafields?: { key: string }[] };
  return { ok: true, keys: (body.members_metafields ?? []).map((each) => each.key) };
}

async function oneMember(lookup: FieldLookup, fetch: Fetch): Promise<FieldRead> {
  const response = await fetch(membersByEmailUrl(lookup.address, lookup.email), { method: "GET", headers: headersFor(lookup.token) });
  if (!response.ok) {
    return { ok: false, problem: `Ghost answered ${response.status} when asked for the member ${lookup.email}.` };
  }
  const body = (await response.json()) as { members?: { id: string; email: string }[] };
  const found = (body.members ?? []).filter((member) => member.email.toLowerCase() === lookup.email.toLowerCase());
  if (found.length === 0) {
    return { ok: false, problem: `No member on ${lookup.address} has the email ${lookup.email}.` };
  }
  if (found.length > 1) {
    return { ok: false, problem: `More than one member on ${lookup.address} has the email ${lookup.email}.` };
  }
  return { ok: true, memberId: found[0].id, text: fieldText(found[0], lookup.field) };
}
