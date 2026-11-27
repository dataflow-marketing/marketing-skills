// dfm-ghost:said-read's dist/run.js run as Claude runs it, against a fake Ghost.

import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { runScript } from "../../../fixtures/run-script.ts";

const SCRIPT = fileURLToPath(new URL("../dist/run.js", import.meta.url));
const ADMIN_KEY = "0123456789abcdef01234567:0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
const LEDGER = ["=== graph ===", "fact new subscribers: ghost coffee-shop new members", "group Regulars: tag regulars", ""].join("\n");
const made: string[] = [];
let folder = "";

async function ghostHas(posts: unknown[], status = 200): Promise<void> {
  await writeFile(join(folder, "fake-ghost-numbers.json"), JSON.stringify({ status, members: [], posts }));
}

function run(...more: string[]) {
  return runScript(SCRIPT, ["--ledger", "ledger.txt", "--settings", "settings.txt", ...more], { cwd: folder, fakeNumbersFolder: folder });
}

beforeEach(async () => {
  folder = await mkdtemp(join(tmpdir(), "dfm-said-read-"));
  made.push(folder);
  await writeFile(join(folder, "ledger.txt"), LEDGER);
  const settings = ["spec 1", "time zone: Australia/Melbourne", "site coffee-shop: ghost https://coffee-shop.example key in COFFEE_SHOP_GHOST_ADMIN_KEY", `keys file: ${join(folder, "keys.env")}`, ""].join("\n");
  await writeFile(join(folder, "settings.txt"), settings);
  await writeFile(join(folder, "keys.env"), `COFFEE_SHOP_GHOST_ADMIN_KEY=${ADMIN_KEY}\n`);
});

afterAll(async () => {
  for (const each of made) {
    await rm(each, { recursive: true, force: true });
  }
});

describe("dfm-ghost:said-read dist/run.js", () => {
  it("prints a Change line for each post that went out in the week and writes nothing", async () => {
    await ghostHas([
      { title: "Iced coffee is back", url: "https://coffee-shop.example/iced/", status: "published", published_at: "2026-11-17T01:00:00.000Z", custom_excerpt: "From Monday.", tags: [{ slug: "regulars" }], email: { email_count: 30, created_at: "2026-11-17T01:05:00.000Z" } },
      { title: "A draft", url: "https://coffee-shop.example/draft/", status: "draft", published_at: "2026-11-18T01:00:00.000Z" },
    ]);
    const ran = await run("--week", "2026-11-16");
    expect(ran.code).toBe(0);
    expect(ran.stdout).toContain('Change: 2026-11-16 said by email and on the website on 2026-11-17: "Iced coffee is back" https://coffee-shop.example/iced/ [Regulars] summary: "From Monday."');
    expect(ran.stdout).not.toContain("A draft");
    expect(await readFile(join(folder, "ledger.txt"), "utf8")).toBe(LEDGER);
  });

  it("says when nothing went out", async () => {
    await ghostHas([]);
    const ran = await run("--week", "2026-11-16");
    expect(ran.stdout).toContain("nothing was sent or published this week");
  });

  it("passes on Ghost's refusal and never prints the key", async () => {
    await ghostHas([], 401);
    const ran = await run();
    expect(ran.code).toBe(2);
    expect(ran.stderr).toContain("Ghost at https://coffee-shop.example said 401 to /posts/");
    expect(ran.stdout + ran.stderr).not.toContain(ADMIN_KEY.split(":")[1]);
  });
});
