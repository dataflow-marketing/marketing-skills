// check-writing.ts run as pnpm check runs it: on this repo, which keeps the writing rules.

import { execFile } from "node:child_process";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { describe, expect, it } from "vitest";

const run = promisify(execFile);
const script = fileURLToPath(new URL("./check-writing.ts", import.meta.url));

describe("check-writing", () => {
  it("finds no breaks in this repo and exits 0", async () => {
    const { stdout } = await run("node", [script]);
    expect(stdout).toMatch(/^checked \d+ files: 0 breaks of the writing rules\n$/);
  });
});
