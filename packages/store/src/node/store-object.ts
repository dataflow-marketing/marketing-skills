// Node edge: reads and writes an object wherever its place is, through the place's connector.
// For Ghost the key is read from the keys file into a five minute token and goes nowhere else: it is never
// returned, printed, logged or put in a problem.

import { adminToken } from "@dataflow-marketing/core";
import { readKey } from "@dataflow-marketing/core/node";
import type { GhostPlace, Place } from "../find-place.ts";
import { readField } from "../ghost/read-field.ts";
import type { Fetch } from "../ghost/member-calls.ts";
import { writeField } from "../ghost/write-field.ts";
import { versionOf } from "../version.ts";
import { objectPath, readObjectFile, writeObjectFile } from "./object-file.ts";

// Where a read found the object: a write goes to the same place
export type Found = { connector: "file"; path: string } | { connector: "ghost"; memberId: string; token: string };

export type ObjectRead = { ok: true; text: string; version: string; found: Found } | { ok: false; problem: string };

export type ObjectWrite = { ok: true } | { ok: false; problem: string };

export async function readObject(place: Place, fetch: Fetch = globalThis.fetch): Promise<ObjectRead> {
  if (place.connector === "file") {
    const path = objectPath(place.path);
    const text = (await readObjectFile(path)) ?? "";
    return { ok: true, text, version: await versionOf(text), found: { connector: "file", path } };
  }
  return readGhostField(place, fetch);
}

export async function writeObject(place: Place, found: Found, text: string, fetch: Fetch = globalThis.fetch): Promise<ObjectWrite> {
  if (found.connector === "file") {
    await writeObjectFile(found.path, text);
    return { ok: true };
  }
  const ghost = place as GhostPlace;
  const change = { address: ghost.site.address, memberId: found.memberId, field: ghost.field, text, token: found.token };
  const written = await writeField(change, fetch);
  return written.ok ? { ok: true } : written;
}

async function readGhostField(place: GhostPlace, fetch: Fetch): Promise<ObjectRead> {
  const token = await tokenFor(place);
  if (!token.ok) {
    return token;
  }
  const lookup = { address: place.site.address, email: place.email, field: place.field, token: token.token };
  const read = await readField(lookup, fetch);
  if (!read.ok) {
    return read;
  }
  const found: Found = { connector: "ghost", memberId: read.memberId, token: token.token };
  return { ok: true, text: read.text, version: await versionOf(read.text), found };
}

async function tokenFor(place: GhostPlace): Promise<{ ok: true; token: string } | { ok: false; problem: string }> {
  try {
    const key = await readKey(place.keysFile, place.site.keyName);
    return { ok: true, token: await adminToken(key) };
  } catch (error) {
    if (error instanceof Error && (error.name === "MissingKeyError" || error.name === "MalformedAdminKeyError")) {
      return { ok: false, problem: error.message };
    }
    return { ok: false, problem: `Cannot read ${place.site.keyName} from the keys file ${place.keysFile}.` };
  }
}
