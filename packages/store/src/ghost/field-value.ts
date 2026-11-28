// One member's custom field as whatever it holds: text, a list of picked choices or nothing. readField and
// writeField (read-field.ts, write-field.ts) keep a store object in a field as text; this is for any other field,
// such as a member's answer to an account question.

import { headersFor, memberUrl, membersByEmailUrl } from "./member-calls.ts";
import type { Fetch } from "./member-calls.ts";

export type FieldValue = string | string[] | null;

export type ValueRead = { ok: true; memberId: string; value: FieldValue } | { ok: false; problem: string };
export type ValueWrite = { ok: true; saved: FieldValue } | { ok: false; problem: string };

export async function readFieldValue(address: string, email: string, field: string, token: string, fetch: Fetch): Promise<ValueRead> {
  const response = await fetch(membersByEmailUrl(address, email), { method: "GET", headers: headersFor(token) });
  if (!response.ok) {
    return { ok: false, problem: `Ghost answered ${response.status} when asked for the member ${email}.` };
  }
  const body = (await response.json()) as { members?: { id: string; email: string }[] };
  const found = (body.members ?? []).filter((member) => member.email.toLowerCase() === email.toLowerCase());
  if (found.length !== 1) {
    return { ok: false, problem: found.length === 0 ? `No member on ${address} has the email ${email}.` : `More than one member on ${address} has the email ${email}.` };
  }
  return { ok: true, memberId: found[0].id, value: valueIn(found[0], field) };
}

// sends the one field only: every other field and the rest of the member are left as they are
export async function writeFieldValue(address: string, memberId: string, field: string, value: FieldValue, token: string, fetch: Fetch): Promise<ValueWrite> {
  const response = await fetch(memberUrl(address, memberId), {
    method: "PUT",
    headers: headersFor(token, true),
    body: JSON.stringify({ members: [{ metafields: { custom: { [field]: value } } }] }),
  });
  if (!response.ok) {
    return { ok: false, problem: `Ghost answered ${response.status} to the change. Read the field again before trying once more.` };
  }
  const body = (await response.json()) as { members?: unknown[] };
  const member = body.members?.[0];
  return member === undefined ? { ok: false, problem: "Ghost answered the change with no member." } : { ok: true, saved: valueIn(member, field) };
}

function valueIn(member: unknown, field: string): FieldValue {
  const value = (member as { metafields?: { custom?: Record<string, unknown> } }).metafields?.custom?.[field];
  if (typeof value === "string") {
    return value;
  }
  if (Array.isArray(value)) {
    return value.filter((each): each is string => typeof each === "string");
  }
  return null;
}
