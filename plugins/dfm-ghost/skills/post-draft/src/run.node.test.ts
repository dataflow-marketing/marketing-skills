// post-draft's dist/run.js, run with Node alone against the fake Ghost.
// The fake is loaded before the script and swaps fetch: no real Ghost is ever called.

import { mkdir, mkdtemp, readFile, utimes, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, expect, it } from "vitest";
import {
  COFFEE_SHOP_ADMIN_KEY,
  COFFEE_SHOP_KEY_ID,
  COFFEE_SHOP_KEY_SECRET,
  COFFEE_SHOP_KEYS,
  FAILED_REPORT,
  ICED_COFFEE_WORDS,
  PASSED_REPORT,
  SAM_TRANSCRIPT,
  coffeeShopSettings,
} from "../../../fixtures/coffee-shop.ts";
import type { SeenRequest } from "../../../fixtures/fake-ghost.ts";
import { runScript } from "../../../fixtures/run-script.ts";
import type { Ran } from "../../../fixtures/run-script.ts";

const SCRIPT = fileURLToPath(new URL("../dist/run.js", import.meta.url));
const QUOTES_CHECK = fileURLToPath(new URL("../../../../dfm-content/skills/quotes-check/dist/run.js", import.meta.url));
const WORDS = "drafts/iced-coffee.txt";
const SOURCE = "recordings/2026-11-28-sam.txt";

let folder = "";

beforeEach(async () => {
  folder = await mkdtemp(join(tmpdir(), "dfm-post-draft-"));
  await mkdir(join(folder, "drafts"));
  await mkdir(join(folder, "recordings"));
  await writeFile(join(folder, ".env"), COFFEE_SHOP_KEYS);
  await writeFile(join(folder, "settings.txt"), coffeeShopSettings(join(folder, ".env")));
  await writeFile(join(folder, SOURCE), SAM_TRANSCRIPT);
  await writeFile(join(folder, WORDS), ICED_COFFEE_WORDS);
  await writeFile(join(folder, "report.txt"), PASSED_REPORT);
});

function postDraft(...more: string[]): Promise<Ran> {
  const args = ["--words", WORDS, "--report", "report.txt", "--site", "coffee-shop", "--settings", "settings.txt", ...more];
  return runScript(SCRIPT, args, { cwd: folder, fakeGhostFolder: folder });
}

function postDraftAnsweredAs(answerAs: string, ...more: string[]): Promise<Ran> {
  const args = ["--words", WORDS, "--report", "report.txt", "--site", "coffee-shop", "--settings", "settings.txt", ...more];
  return runScript(SCRIPT, args, { cwd: folder, fakeGhostFolder: folder, answerAs });
}

async function requestsSeen(): Promise<SeenRequest[]> {
  let text = "";
  try {
    text = await readFile(join(folder, "fake-ghost-requests.jsonl"), "utf8");
  } catch {
    return [];
  }
  return text.trim().split("\n").map((line) => JSON.parse(line) as SeenRequest);
}

async function runLog(): Promise<string> {
  try {
    return await readFile(join(folder, "run-log.txt"), "utf8");
  } catch {
    return "";
  }
}

describe("post-draft --preview", () => {
  it("shows the request and sends nothing", async () => {
    const ran = await postDraft("--preview");
    expect(ran.code).toBe(0);
    expect(ran.stdout).toContain("preview: nothing sent");
    expect(ran.stdout).toContain("would send: POST https://coffee-shop.example/ghost/api/admin/posts/?source=html");
    expect(ran.stdout).toContain('"title": "Iced coffee is back"');
    expect(await requestsSeen()).toEqual([]);
    expect(await runLog()).toBe("");
  });

  it("is what runs when no mode is named", async () => {
    const ran = await postDraft();
    expect(ran.stdout).toContain("preview: nothing sent");
    expect(await requestsSeen()).toEqual([]);
  });
});

describe("post-draft --go", () => {
  it("creates a draft, never sends a status and reads it back", async () => {
    const ran = await postDraft("--go");
    expect(ran.stderr).toBe("");
    expect(ran.code).toBe(0);
    expect(ran.stdout).toContain("created on coffee-shop: id post1");
    expect(ran.stdout).toContain('read back: status draft, title "Iced coffee is back", slug iced-coffee');
    expect(ran.stdout).toContain("read back: passed");

    const requests = await requestsSeen();
    expect(requests.map((request) => request.method)).toEqual(["POST", "GET"]);
    const sent = JSON.parse(requests[0].body ?? "");
    expect(sent.posts[0]).not.toHaveProperty("status");
    expect(requests[0].body).not.toContain("status");
  });

  it("sends exactly the body the preview showed", async () => {
    const preview = await postDraft("--preview", "--json");
    await postDraft("--go");
    const requests = await requestsSeen();
    expect(JSON.parse(requests[0].body ?? "")).toEqual(JSON.parse(preview.stdout).body);
  });

  it("writes one run log line for the write", async () => {
    await postDraft("--go");
    const lines = (await runLog()).trimEnd().split("\n");
    expect(lines.length).toBe(1);
    expect(lines[0]).toContain('| dfm-ghost:post-draft | post draft | ghost coffee-shop https://coffee-shop.example | before: (none) | after: draft "Iced coffee is back" id post1 slug iced-coffee');
  });

  it("fails loudly when Ghost reads back published yet still logs the write", async () => {
    const ran = await postDraftAnsweredAs("published", "--go");
    expect(ran.code).toBe(2);
    expect(ran.stderr).toContain("FAILED: Ghost says the post is published, not a draft.");
    expect(ran.stdout).toContain("open it in Ghost: https://coffee-shop.example/ghost/#/editor/post/post1");
    expect(await runLog()).toContain('after: published "Iced coffee is back"');
  });

  it("never prints or logs the key or the token", async () => {
    const ran = await postDraft("--go");
    const requests = await requestsSeen();
    const token = requests[0].headers.Authorization.replace("Ghost ", "");
    const everything = `${ran.stdout}${ran.stderr}${await runLog()}`;

    for (const secret of [COFFEE_SHOP_ADMIN_KEY, COFFEE_SHOP_KEY_SECRET, COFFEE_SHOP_KEY_ID, token]) {
      expect(everything).not.toContain(secret);
    }
  });

  it("names the variable, never the key, when the key is not in Ghost's form", async () => {
    const badKey = "not-a-ghost-key-0123456789";
    await writeFile(join(folder, ".env"), `COFFEE_SHOP_GHOST_ADMIN_KEY=${badKey}\n`);
    const ran = await postDraft("--go");
    expect(ran.code).toBe(2);
    expect(`${ran.stdout}${ran.stderr}`).not.toContain(badKey);
    expect(await requestsSeen()).toEqual([]);
  });
});

describe("post-draft --read-back", () => {
  it("reads a draft back later by its id", async () => {
    await postDraft("--go");
    const ran = await postDraft("--read-back", "--id", "post1");
    expect(ran.code).toBe(0);
    expect(ran.stdout).toContain("read back: passed");
  });

  it("fails when Ghost now says it is published", async () => {
    await postDraft("--go");
    const ran = await postDraftAnsweredAs("published", "--read-back", "--id", "post1");
    expect(ran.code).toBe(2);
    expect(ran.stderr).toContain("FAILED");
  });
});

describe("post-draft refuses before sending", () => {
  it("when the check report found problems", async () => {
    await writeFile(join(folder, "report.txt"), FAILED_REPORT);
    const ran = await postDraft("--go");
    expect(ran.code).toBe(2);
    expect(ran.stderr).toContain("The check report says: 1 problem.");
    expect(await requestsSeen()).toEqual([]);
    expect(await runLog()).toBe("");
  });

  it("when the words file changed after the check", async () => {
    const later = new Date(Date.now() + 60_000);
    await utimes(join(folder, WORDS), later, later);
    const ran = await postDraft("--go");
    expect(ran.code).toBe(2);
    expect(ran.stderr).toContain("The words file changed after the check.");
    expect(await requestsSeen()).toEqual([]);
  });

  it("when the words are only an idea", async () => {
    await writeFile(join(folder, WORDS), ICED_COFFEE_WORDS.replace("state: draft", "state: idea"));
    await writeFile(join(folder, "report.txt"), PASSED_REPORT);
    const ran = await postDraft("--go");
    expect(ran.code).toBe(2);
    expect(ran.stderr).toContain("state is idea");
    expect(await requestsSeen()).toEqual([]);
  });

  it("when the site is not in settings", async () => {
    const args = ["--words", WORDS, "--report", "report.txt", "--site", "bakery", "--settings", "settings.txt", "--go"];
    const ran = await runScript(SCRIPT, args, { cwd: folder, fakeGhostFolder: folder });
    expect(ran.code).toBe(2);
    expect(ran.stderr).toContain("Add it with dfm-ghost:site-add.");
  });
});

describe("the first loop", () => {
  it("a words file that passes quotes-check goes to the fake Ghost as a draft", async () => {
    const checked = await runScript(QUOTES_CHECK, ["--text", WORDS, "--against", SOURCE], { cwd: folder });
    expect(checked.code).toBe(0);
    await writeFile(join(folder, "report.txt"), checked.stdout);

    const ran = await postDraft("--go");
    expect(ran.code).toBe(0);
    expect(ran.stdout).toContain("read back: passed");
  });
});
