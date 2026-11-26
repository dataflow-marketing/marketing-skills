import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { pluginFolders, specCopy, specFiles } from "./copy-spec.ts";

const REPO = fileURLToPath(new URL("..", import.meta.url));

describe("copy-spec", () => {
  it("points a link out of spec/ to GitHub and leaves links inside it", () => {
    expect(specCopy("[log](../DECISIONS.md) and [ledger](ledger.md)")).toBe(
      "[log](https://github.com/dataflow-marketing/marketing-skills/blob/develop/DECISIONS.md) and [ledger](ledger.md)",
    );
  });

  it("every plugin has the spec as it is now (run pnpm build when this fails)", async () => {
    for (const plugin of await pluginFolders()) {
      for (const file of await specFiles()) {
        const copy = await readFile(join(plugin, "spec", file), "utf8").catch(() => "missing");
        expect(copy, `${plugin}/spec/${file}`).toBe(specCopy(await readFile(join(REPO, "spec", file), "utf8")));
      }
    }
  });

  it("every link in a skill stays inside its plugin", async () => {
    for (const plugin of await pluginFolders()) {
      const skills = await import("node:fs/promises").then((fs) => fs.readdir(join(plugin, "skills")));
      for (const skill of skills) {
        const text = await readFile(join(plugin, "skills", skill, "SKILL.md"), "utf8");
        expect(text, `${plugin}/skills/${skill}`).not.toMatch(/\]\((\.\.\/){3,}/);
      }
    }
  });
});
