// The test for index.ts: every module of the ledger keeps a Worker's limits (no Node APIs).

import { fileURLToPath } from "node:url";
import { nodeInWorkModules } from "@dataflow-marketing/core/build";
import { describe, expect, it } from "vitest";

const SOURCE = fileURLToPath(new URL("./", import.meta.url));

describe("the ledger's modules", () => {
  it("import nothing from Node", async () => {
    expect(await nodeInWorkModules(SOURCE, [])).toEqual([]);
  });
});
