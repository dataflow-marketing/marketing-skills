// The test for index.ts: every work module of the store keeps a Worker's limits (no Node APIs).

import { fileURLToPath } from "node:url";
import { nodeInWorkModules } from "@dataflow-marketing/core/build";
import { describe, expect, it } from "vitest";

const SOURCE = fileURLToPath(new URL("./", import.meta.url));

describe("the store's work modules", () => {
  it("import nothing from Node", async () => {
    expect(await nodeInWorkModules(SOURCE, ["node"])).toEqual([]);
  });
});
