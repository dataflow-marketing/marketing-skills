import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { COFFEE_SHOP_SETTINGS } from "../../fixtures/coffee-shop.ts";
import { readSettings } from "./read-settings.ts";

let folder = "";

beforeAll(async () => {
  folder = await mkdtemp(join(tmpdir(), "dfm-core-"));
  await writeFile(join(folder, "settings.txt"), COFFEE_SHOP_SETTINGS);
});

afterAll(async () => {
  await rm(folder, { recursive: true, force: true });
});

describe("readSettings", () => {
  it("reads the coffee shop settings file", async () => {
    const { settings, problems } = await readSettings(join(folder, "settings.txt"));
    expect(problems).toEqual([]);
    expect(settings.sites.length).toBe(2);
  });
});
