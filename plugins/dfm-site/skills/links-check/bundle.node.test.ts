// The test for bundle.ts: dist/run.js is what its source builds today.

import { fileURLToPath } from "node:url";
import { distIsCurrent } from "@dataflow-marketing/core/build";
import { describe, expect, it } from "vitest";
import { linksCheckBundle } from "./bundle.ts";

const pluginFolder = fileURLToPath(new URL("../../", import.meta.url));

describe("links-check dist/run.js", () => {
  it("matches what its source builds", async () => {
    const check = await distIsCurrent(linksCheckBundle(pluginFolder));
    expect(check.reason).toBe("dist/run.js matches its source");
  });
});
