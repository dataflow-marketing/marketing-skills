// The test for bundle.ts: dist/run.js is what its source builds today.

import { fileURLToPath } from "node:url";
import { distIsCurrent } from "@dataflow-marketing/core/build";
import { describe, expect, it } from "vitest";
import { planCheckBundle } from "./bundle.ts";

const pluginFolder = fileURLToPath(new URL("../../", import.meta.url));

describe("plan-check dist/run.js", () => {
  it("matches what its source builds", async () => {
    const check = await distIsCurrent(planCheckBundle(pluginFolder));
    expect(check.reason).toBe("dist/run.js matches its source");
  });
});
