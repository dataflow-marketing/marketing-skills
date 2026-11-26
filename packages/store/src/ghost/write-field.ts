// Writes one member's custom field and gives back what Ghost says it saved.
// Ghost has no version check on a member write: the caller reads the field again just before this.

import { changeBody, fieldText, headersFor, memberUrl } from "./member-calls.ts";
import type { Fetch } from "./member-calls.ts";

export type FieldWrite = { ok: true; saved: string } | { ok: false; problem: string };

export type FieldChange = { address: string; memberId: string; field: string; text: string; token: string };

export async function writeField(change: FieldChange, fetch: Fetch): Promise<FieldWrite> {
  const response = await fetch(memberUrl(change.address, change.memberId), {
    method: "PUT",
    headers: headersFor(change.token, true),
    body: changeBody(change.field, change.text),
  });
  if (!response.ok) {
    return { ok: false, problem: `Ghost answered ${response.status} to the change. Read the field again before trying once more.` };
  }
  const body = (await response.json()) as { members?: unknown[] };
  const member = body.members?.[0];
  if (member === undefined) {
    return { ok: false, problem: "Ghost answered the change with no member." };
  }
  return { ok: true, saved: fieldText(member, change.field) };
}
