// The custom fields a Ghost site has for its members, as Ghost defines them: each field's key, its name (the
// question a member sees), its type and, for a pick list, its choices and whether more than one may be picked.
// Member custom fields came in a Ghost newer than 6.58: an older Ghost has no fields list to read.

import { fieldsUrl, headersFor } from "./member-calls.ts";
import type { Fetch } from "./member-calls.ts";

export type FieldDefinition = { key: string; name: string; type: string; options?: string[]; multiple: boolean };

export type DefinitionsRead = { ok: true; fields: FieldDefinition[] } | { ok: false; problem: string };

type GhostField = { key: string; name?: string; type?: string; settings?: { options?: unknown; multiple?: unknown } };

export async function fieldDefinitions(address: string, token: string, fetch: Fetch): Promise<DefinitionsRead> {
  const response = await fetch(fieldsUrl(address), { method: "GET", headers: headersFor(token) });
  if (response.status === 404 || response.status === 406) {
    return { ok: false, problem: `${address} has no member custom fields: they need a newer Ghost than this site runs.` };
  }
  if (!response.ok) {
    return { ok: false, problem: `Ghost answered ${response.status} when asked for its member fields.` };
  }
  const body = (await response.json()) as { members_metafields?: GhostField[] };
  return { ok: true, fields: (body.members_metafields ?? []).map(definitionOf) };
}

function definitionOf(field: GhostField): FieldDefinition {
  const options = Array.isArray(field.settings?.options) ? field.settings.options.filter((each): each is string => typeof each === "string") : undefined;
  const definition: FieldDefinition = { key: field.key, name: field.name ?? field.key, type: field.type ?? "text", multiple: field.settings?.multiple === true };
  if (options && options.length > 0) {
    definition.options = options;
  }
  return definition;
}
