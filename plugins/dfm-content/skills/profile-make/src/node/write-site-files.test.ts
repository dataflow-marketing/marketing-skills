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
    const first = await writeSiteFiles(site, { home: "home words", pages: "full words", pagesName: "llms-full.txt", counted: "=== counted ===", fingerprints: "abc http://x/\n" });
    expect(first.ok).toBe(true);
    expect(await readFile(join(site, "home.txt"), "utf8")).toBe("home words");
    expect(await readFile(join(site, "counted.txt"), "utf8")).toBe("=== counted ===\n");
    expect(await readFile(join(site, "fingerprints.txt"), "utf8")).toBe("abc http://x/\n");
    const again = await writeSiteFiles(site, { home: "new", pages: "new", pagesName: "llms-full.txt", counted: "new", fingerprints: "new" });
    expect(again.ok).toBe(false);
    expect(await readFile(join(site, "home.txt"), "utf8")).toBe("home words");
  });

  it("writes changed.txt after a read since an earlier one", async () => {
    const later = join(folder, "later");
    const written = await writeSiteFiles(later, { home: "h", pages: "p", pagesName: "pages.txt", counted: "c", fingerprints: "f", changed: "## New" });
    expect(written.ok && written.files.changedFile).toBe(join(later, "changed.txt"));
    expect(await readFile(join(later, "changed.txt"), "utf8")).toBe("## New");
  });
});
