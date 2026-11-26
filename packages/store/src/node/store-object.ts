// Node edge: reads and writes an object wherever its place is, through the place's connector.
// For Ghost the key is read from the keys file into a five minute token; for a rest store the key itself is sent
// as a Bearer key. Either way it goes nowhere else: it is never returned to a skill's output, printed, logged or
// put in a problem.

import { adminToken } from "@dataflow-marketing/core";
import { readKey } from "@dataflow-marketing/core/node";
import type { GhostPlace, Place, RestPlace } from "../find-place.ts";
import { readField } from "../ghost/read-field.ts";
import type { Fetch } from "../ghost/member-calls.ts";
import { writeField } from "../ghost/write-field.ts";
import { readRest } from "../rest/read-rest.ts";
import { writeRest } from "../rest/write-rest.ts";
import { GHOST_FIELD_LIMIT } from "../write/decide-write.ts";
import { versionOf } from "../version.ts";
import { objectPath, readObjectFile, removeObjectFile, writeObjectFile } from "./object-file.ts";

// Where a read found the object: a write goes to the same place, at the version it was read at
export type Found =
  | { connector: "file"; path: string }
  | { connector: "ghost"; memberId: string; token: string }
  | { connector: "rest"; key: string; version: string };

// limit: the largest body the store takes, in bytes; undefined for a file
export type ObjectRead =
  | { ok: true; text: string; version: string; limit: number | undefined; found: Found }
  | { ok: false; problem: string };

// moved: the store refused the write because the object changed since it was read (a rest store's 409)
export type ObjectWrite = { ok: true } | { ok: false; moved: boolean; problem: string };

export async function readObject(place: Place, fetch: Fetch = globalThis.fetch): Promise<ObjectRead> {
  if (place.connector === "file") {
    return readFile(place.path);
  }
  if (place.connector === "ghost") {
    return readGhostField(place, fetch);
  }
  return readRestObject(place, fetch);
}

export async function writeObject(place: Place, found: Found, text: string, fetch: Fetch = globalThis.fetch): Promise<ObjectWrite> {
  if (found.connector === "file") {
    await writeObjectFile(found.path, text);
    return { ok: true };
  }
  if (found.connector === "ghost") {
    return writeGhostField(place as GhostPlace, found, text, fetch);
  }
  return writeRestObject(place as RestPlace, found, text, fetch);
}

async function readFile(placePath: string): Promise<ObjectRead> {
  const path = objectPath(placePath);
  const text = (await readObjectFile(path)) ?? "";
  return { ok: true, text, version: await versionOf(text), limit: undefined, found: { connector: "file", path } };
}

// Empties the object: a file is removed; a Ghost field is set to null (spec/store.md, add and remove)
export async function removeObject(place: Place, found: Found, fetch: Fetch = globalThis.fetch): Promise<ObjectWrite> {
  if (found.connector === "file") {
    await removeObjectFile(found.path);
    return { ok: true };
  }
  return writeObject(place, found, "", fetch);
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
  return { ok: true, text: read.text, version: await versionOf(read.text), limit: GHOST_FIELD_LIMIT, found };
}

async function writeGhostField(place: GhostPlace, found: Extract<Found, { connector: "ghost" }>, text: string, fetch: Fetch): Promise<ObjectWrite> {
  const change = { address: place.site.address, memberId: found.memberId, field: place.field, text, token: found.token };
  const written = await writeField(change, fetch);
  return written.ok ? { ok: true } : { ok: false, moved: false, problem: written.problem };
}

// A rest store's version is its own: it is shown and sent back as the store gave it
async function readRestObject(place: RestPlace, fetch: Fetch): Promise<ObjectRead> {
  const key = await keyFor(place.keysFile, place.keyName);
  if (!key.ok) {
    return key;
  }
  const read = await readRest({ address: place.address, kind: place.kind, id: place.id, key: key.key }, fetch);
  if (!read.ok) {
    return read;
  }
  const found: Found = { connector: "rest", key: key.key, version: read.version };
  return { ok: true, text: read.text, version: read.version, limit: read.limit, found };
}

async function writeRestObject(place: RestPlace, found: Extract<Found, { connector: "rest" }>, text: string, fetch: Fetch): Promise<ObjectWrite> {
  const change = { address: place.address, kind: place.kind, id: place.id, key: found.key, readAt: found.version, text };
  const written = await writeRest(change, fetch);
  if (written.ok) {
    return { ok: true };
  }
  if (written.moved) {
    return { ok: false, moved: true, problem: `The ${place.kind} ${place.id} changed in the store since it was read. Nothing was written.` };
  }
  return { ok: false, moved: false, problem: written.problem };
}

async function tokenFor(place: GhostPlace): Promise<{ ok: true; token: string } | { ok: false; problem: string }> {
  const key = await keyFor(place.keysFile, place.site.keyName);
  if (!key.ok) {
    return key;
  }
  try {
    return { ok: true, token: await adminToken(key.key) };
  } catch (error) {
    if (error instanceof Error && error.name === "MalformedAdminKeyError") {
      return { ok: false, problem: error.message };
    }
    return { ok: false, problem: `Cannot read ${place.site.keyName} from the keys file ${place.keysFile}.` };
  }
}

async function keyFor(keysFile: string, keyName: string): Promise<{ ok: true; key: string } | { ok: false; problem: string }> {
  try {
    return { ok: true, key: await readKey(keysFile, keyName) };
  } catch (error) {
    if (error instanceof Error && error.name === "MissingKeyError") {
      return { ok: false, problem: error.message };
    }
    return { ok: false, problem: `Cannot read ${keyName} from the keys file ${keysFile}.` };
  }
}
