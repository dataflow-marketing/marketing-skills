// Every skill's work modules keep a Worker's limits: no Node APIs.
// Only the edges may use Node: each skill's src/node and run.ts, the main file.

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { nodeInWorkModules } from "@dataflow-marketing/core/build";
import { describe, expect, it } from "vitest";

const SKILLS = ["site-add", "post-draft", "numbers-read", "said-read", "fields-change"];

describe("dfm-ghost work modules", () => {
  for (const skill of SKILLS) {
    it(`in ${skill} import nothing from Node`, async () => {
      const source = fileURLToPath(new URL(`./skills/${skill}/src/`, import.meta.url));
      expect(await nodeInWorkModules(source, ["node", "run.ts"])).toEqual([]);
    });
  }
});

// Finding 21 (trial, 26 Nov): the key's variable and the keys file were picked for the person in a sentence.
// site-add must offer each usual answer as a suggestion in the dialog, never choose it.
describe("dfm-ghost:site-add offers usual answers, never chooses them", () => {
  const skillPath = fileURLToPath(new URL("./skills/site-add/SKILL.md", import.meta.url));

  it("asks in the dialog and never chooses an answer for the person", async () => {
    const skill = await readFile(skillPath, "utf8");
    expect(skill).toContain("Ask each one in the question dialog");
    expect(skill).toContain("never choose an answer for the person");
  });

  it("suggests the key's variable from the site's name and the keys file", async () => {
    const skill = await readFile(skillPath, "utf8");
    expect(skill).toContain("Suggest one made from the site's name");
    expect(skill).toContain("Suggest `~/.config/dfm/.env`");
  });

  it("asks only for what a public site does not have yet when it becomes a Ghost site", async () => {
    const skill = await readFile(skillPath, "utf8");
    expect(skill).toContain("ask only for the key's variable");
  });
});
