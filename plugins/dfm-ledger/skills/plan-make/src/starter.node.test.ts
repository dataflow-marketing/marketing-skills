// The starter in the skill is examples/starter/ledger.txt word for word. A .node.test.ts: it reads the example.

import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { STARTER } from "./starter.ts";

const EXAMPLE = new URL("../../../../../examples/starter/ledger.txt", import.meta.url);

describe("STARTER", () => {
  it("is the starter example word for word", async () => {
    expect(STARTER).toBe(await readFile(EXAMPLE, "utf8"));
  });
});
