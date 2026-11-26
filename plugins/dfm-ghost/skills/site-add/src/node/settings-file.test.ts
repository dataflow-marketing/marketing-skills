import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { appendSettingsText, readSettingsText } from "./settings-file.ts";

describe("site-add's settings file edge", () => {
  it("reads nothing from a missing file and appends to a file", async () => {
    const folder = await mkdtemp(join(tmpdir(), "dfm-settings-"));
    const path = join(folder, "settings.txt");
    expect(await readSettingsText(path)).toBeUndefined();
    await appendSettingsText(path, "spec 1\n");
    expect(await readSettingsText(path)).toBe("spec 1\n");
  });
});
