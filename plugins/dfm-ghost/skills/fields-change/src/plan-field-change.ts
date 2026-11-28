// Works out one field change before anything is sent: the field as Ghost defines it, the one member with the email,
// what the field holds now and its version; the value that would be sent, checked against the field.

import { fieldDefinitions, NO_VERSION, readFieldValue, versionOf } from "@dataflow-marketing/store";
import type { Fetch, FieldDefinition, FieldValue } from "@dataflow-marketing/store";
import { chosenValue } from "./chosen-value.ts";

export type FieldPlan = { field: FieldDefinition; memberId: string; now: FieldValue; next: FieldValue; version: string };
export type PlanResult = { ok: true; plan: FieldPlan } | { ok: false; problem: string };

export type Asked = { address: string; token: string; email: string; field: string; value: string };

export async function planFieldChange(asked: Asked, send: Fetch): Promise<PlanResult> {
  const defined = await fieldDefinitions(asked.address, asked.token, send);
  if (!defined.ok) {
    return defined;
  }
  const field = defined.fields.find((each) => each.key === asked.field);
  if (!field) {
    return { ok: false, problem: `The site has no member field called ${asked.field}. Its fields: ${defined.fields.map((each) => each.key).join(", ") || "none"}.` };
  }
  const chosen = chosenValue(field, asked.value);
  if (!chosen.ok) {
    return chosen;
  }
  const held = await readFieldValue(asked.address, asked.email, asked.field, asked.token, send);
  if (!held.ok) {
    return held;
  }
  return { ok: true, plan: { field, memberId: held.memberId, now: held.value, next: chosen.value, version: await versionOfValue(held.value) } };
}

// a field's version: the hash of what it holds, as the store makes it for an object; nothing held is "none"
export async function versionOfValue(value: FieldValue): Promise<string> {
  return value === null ? NO_VERSION : versionOf(JSON.stringify(value));
}
