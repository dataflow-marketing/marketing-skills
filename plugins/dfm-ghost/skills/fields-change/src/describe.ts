// What a change would do, did or finds, in plain lines. The token and the key are never in them.

import type { FieldDefinition, FieldValue } from "@dataflow-marketing/store";

export function shown(value: FieldValue): string {
  if (value === null) {
    return "(nothing)";
  }
  return Array.isArray(value) ? value.join(" | ") || "(nothing)" : `"${value}"`;
}

export function describePreview(site: string, email: string, field: FieldDefinition, now: FieldValue, next: FieldValue, version: string): string {
  return [
    `fields-change: ${site}, ${email}`,
    `field: ${field.key} (${field.name})`,
    `now: ${shown(now)}`,
    `would be: ${shown(next)}`,
    `version: ${version}`,
    sameValue(now, next) ? "no change: it already holds this" : `to change it: the same command with --go --version ${version}`,
  ].join("\n");
}

export function sameValue(a: FieldValue, b: FieldValue): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}
