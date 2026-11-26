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
  it("writes home.txt, llms-full.txt and counted.txt, then refuses to write over them", async () => {
    folder = await mkdtemp(join(tmpdir(), "dfm-profile-"));
    const site = join(folder, "site");
    const first = await writeSiteFiles(site, { home: "home words", pages: "full words", pagesName: "llms-full.txt", counted: "=== counted ===" });
    expect(first.ok).toBe(true);
    expect(await readFile(join(site, "home.txt"), "utf8")).toBe("home words");
    expect(await readFile(join(site, "counted.txt"), "utf8")).toBe("=== counted ===\n");
    const again = await writeSiteFiles(site, { home: "new", pages: "new", pagesName: "llms-full.txt", counted: "new" });
    expect(again.ok).toBe(false);
    expect(await readFile(join(site, "home.txt"), "utf8")).toBe("home words");
  });
});
