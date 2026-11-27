// The work modules every plugin shares.
// Web standard APIs only: each can run in Node or in a Cloudflare Worker.
// The Node edges are in "@dataflow-marketing/core/node".

export { parseSettings } from "./settings/parse-settings.ts";
export { checkSettings } from "./settings/check-settings.ts";
export type { Binding, HouseRule, Settings, SettingsResult, Site, Store } from "./settings/types.ts";

export { parseKeysFile } from "./keys/parse-keys-file.ts";
export type { Keys } from "./keys/parse-keys-file.ts";
export { findKey, MissingKeyError } from "./keys/find-key.ts";
export { keyFromEnv } from "./keys/key-from-env.ts";

export { adminToken } from "./ghost/token.ts";
export { MalformedAdminKeyError, parseAdminKey } from "./ghost/admin-key.ts";
export type { AdminKey } from "./ghost/admin-key.ts";

export { formatRunLine } from "./run-log/format-run-line.ts";
export type { RunLogEntry } from "./run-log/format-run-line.ts";

export { outputMode } from "./output/output-mode.ts";
export type { OutputMode } from "./output/output-mode.ts";
export { formatOutput } from "./output/format-output.ts";
export type { ScriptResult } from "./output/format-output.ts";
export { EXIT_DONE, EXIT_PROBLEMS_FOUND, EXIT_REFUSED_OR_FAILED } from "./output/exit-codes.ts";
export { isModeFlag, writeMode } from "./output/write-mode.ts";
export { nowIn } from "./time/now-in.ts";
export { isLocalAddress } from "./address/local-address.ts";
export type { WriteMode, WriteModeResult } from "./output/write-mode.ts";
