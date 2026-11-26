import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { readTextFiles } from "./read-text-files.ts";
import { COFFEE_SHOP_SITE, DRAFT_WITH_INVENTIONS } from "../../../../fixtures/coffee-shop.ts";

describe("readTextFiles", () => {
  it("reads the text and its sources", async () => {
    const folder = await mkdtemp(join(tmpdir(), "dfm-read-text-"));
    const text = join(folder, "draft.txt");
    const site = join(folder, "site.txt");
    await writeFile(text, DRAFT_WITH_INVENTIONS);
    await writeFile(site, COFFEE_SHOP_SITE);

    const read = await readTextFiles({ text, against: [site] });
    expect(read).toEqual({ ok: true, text: DRAFT_WITH_INVENTIONS, sources: [{ name: site, text: COFFEE_SHOP_SITE }] });
  });

  it("fails on a source it cannot read", async () => {
    const folder = await mkdtemp(join(tmpdir(), "dfm-read-text-"));
    const text = join(folder, "draft.txt");
    await writeFile(text, DRAFT_WITH_INVENTIONS);

    const read = await readTextFiles({ text, against: [join(folder, "missing.txt")] });
    expect(read.ok).toBe(false);
  });
});
