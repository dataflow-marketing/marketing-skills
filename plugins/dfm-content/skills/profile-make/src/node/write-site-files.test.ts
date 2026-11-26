import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { writeSiteFiles } from "./write-site-files.ts";

let folder = "";

afterAll(async () => {
  await rm(folder, { recursive: true, force: true });
});

describe("writeSiteFiles", () => {
  it("writes home.txt and llms-full.txt, then refuses to write over them", async () => {
    folder = await mkdtemp(join(tmpdir(), "dfm-profile-"));
    const site = join(folder, "site");
    const first = await writeSiteFiles(site, "home words", "full words", "llms-full.txt");
    expect(first.ok).toBe(true);
    expect(await readFile(join(site, "home.txt"), "utf8")).toBe("home words");
    const again = await writeSiteFiles(site, "new", "new", "llms-full.txt");
    expect(again.ok).toBe(false);
    expect(await readFile(join(site, "home.txt"), "utf8")).toBe("home words");
  });
});
