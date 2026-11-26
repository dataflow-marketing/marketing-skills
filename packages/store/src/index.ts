// The store's work modules (spec/store.md). Web standard APIs only: each can run in Node or in a Cloudflare Worker.
// The Node edges are in "@dataflow-marketing/store/node".

export { NO_VERSION, versionOf } from "./version.ts";
export { findPlace } from "./find-place.ts";
export type { FilePlace, GhostPlace, Place, PlaceResult } from "./find-place.ts";

export { readField } from "./ghost/read-field.ts";
export type { FieldLookup, FieldRead } from "./ghost/read-field.ts";
export { writeField } from "./ghost/write-field.ts";
export type { FieldChange, FieldWrite } from "./ghost/write-field.ts";
export type { Fetch } from "./ghost/member-calls.ts";

export { GHOST_FIELD_LIMIT, decideWrite, readBackProblems, sameText } from "./write/decide-write.ts";
export type { Decision, WriteCheck } from "./write/decide-write.ts";
export { lineChanges } from "./write/line-changes.ts";
export type { LineChanges } from "./write/line-changes.ts";
export { backupName } from "./write/backup-name.ts";

export { readFlags } from "./args/read-flags.ts";
export type { FlagRules, FlagsResult } from "./args/read-flags.ts";
