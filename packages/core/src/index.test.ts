// The test for index.ts: every work module it shares keeps a Worker's limits (no Node APIs).
// Only the edge folders (src/node and src/build) may use Node.

import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { nodeInWorkModules } from "./build/node-in-work-modules.ts";

const SOURCE = fileURLToPath(new URL("./", import.meta.url));

describe("core's work modules", () => {
  it("import nothing from Node", async () => {
    expect(await nodeInWorkModules(SOURCE, ["node", "build"])).toEqual([]);
  });
});
