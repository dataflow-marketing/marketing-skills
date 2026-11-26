// The instructions in the skill are spec/ask-ai-instructions.txt word for word. A .node.test.ts: it reads the spec.

import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { INSTRUCTIONS } from "./instructions.ts";

const SPEC = new URL("../../../../../spec/ask-ai-instructions.txt", import.meta.url);

describe("INSTRUCTIONS", () => {
  it("are spec/ask-ai-instructions.txt word for word", async () => {
    expect(INSTRUCTIONS).toBe(await readFile(SPEC, "utf8"));
  });
});
