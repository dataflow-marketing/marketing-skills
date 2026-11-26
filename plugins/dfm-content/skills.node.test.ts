// Every skill's work modules keep a Worker's limits: no Node APIs.
// Only the edges may use Node: each skill's src/node and run.ts, the main file.

import { fileURLToPath } from "node:url";
import { nodeInWorkModules } from "@dataflow-marketing/core/build";
import { describe, expect, it } from "vitest";

const SKILLS = ["quotes-check"];

describe("dfm-content work modules", () => {
  for (const skill of SKILLS) {
    it(`in ${skill} import nothing from Node`, async () => {
      const source = fileURLToPath(new URL(`./skills/${skill}/src/`, import.meta.url));
      expect(await nodeInWorkModules(source, ["node", "run.ts"])).toEqual([]);
    });
  }
});
