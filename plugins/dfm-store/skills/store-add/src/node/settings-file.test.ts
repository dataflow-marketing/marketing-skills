import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { appendSettingsText, readSettingsText } from "./settings-file.ts";

describe("the settings file", () => {
  it("reads as undefined when it is not there", async () => {
    const folder = await mkdtemp(join(tmpdir(), "dfm-store-add-"));
    expect(await readSettingsText(join(folder, "settings.txt"))).toBeUndefined();
  });

  it("appends lines after what is there", async () => {
    const folder = await mkdtemp(join(tmpdir(), "dfm-store-add-"));
    const path = join(folder, "settings.txt");
    await writeFile(path, "spec 1\n");
    await appendSettingsText(path, "store notes: file ~/x\n");
    expect(await readSettingsText(path)).toBe("spec 1\nstore notes: file ~/x\n");
  });
});
