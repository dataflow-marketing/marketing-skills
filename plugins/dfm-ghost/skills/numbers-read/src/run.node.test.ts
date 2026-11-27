// dfm-ghost:numbers-read's dist/run.js run as Claude runs it, against a fake Ghost.

import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { runScript } from "../../../fixtures/run-script.ts";

const SCRIPT = fileURLToPath(new URL("../dist/run.js", import.meta.url));
// a made up Admin API key: an id, a colon and a secret in hex
const ADMIN_KEY = "0123456789abcdef01234567:0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
const LEDGER = [
  "=== graph ===",
  "fact new subscribers: ghost coffee-shop new members",
  "fact opens: ghost coffee-shop email opens",
  "fact nudge opens: ghost coffee-shop nudge opens",
  "group Regulars: tag regulars",
  "fact cups served: told",
  "",
].join("\n");
const made: string[] = [];
let folder = "";

async function ghostHas(members: { email: string; created_at: string }[], posts: unknown[], status = 200): Promise<void> {
  await writeFile(join(folder, "fake-ghost-numbers.json"), JSON.stringify({ status, members, posts }));
}

function run(...more: string[]) {
  return runScript(SCRIPT, ["--ledger", "ledger.txt", "--settings", "settings.txt", ...more], { cwd: folder, fakeNumbersFolder: folder });
}

beforeEach(async () => {
  folder = await mkdtemp(join(tmpdir(), "dfm-numbers-read-"));
  made.push(folder);
  await writeFile(join(folder, "ledger.txt"), LEDGER);
  const settings = [
    "spec 1",
    "time zone: Australia/Melbourne",
    "site coffee-shop: ghost https://coffee-shop.example key in COFFEE_SHOP_GHOST_ADMIN_KEY",
    `keys file: ${join(folder, "keys.env")}`,
    "own email: owner@coffee-shop.example",
    "",
  ].join("\n");
  await writeFile(join(folder, "settings.txt"), settings);
  await writeFile(join(folder, "keys.env"), `COFFEE_SHOP_GHOST_ADMIN_KEY=${ADMIN_KEY}\n`);
});

afterAll(async () => {
  for (const each of made) {
    await rm(each, { recursive: true, force: true });
  }
});

describe("dfm-ghost:numbers-read dist/run.js", () => {
  it("reads new members and email opens for a week gone by and writes nothing", async () => {
    await ghostHas(
      [
        { email: "a@example.test", created_at: "2026-11-16T01:00:00.000Z" },
        { email: "owner@coffee-shop.example", created_at: "2026-11-17T01:00:00.000Z" },
        { email: "b@example.test", created_at: "2026-11-01T01:00:00.000Z" },
      ],
      [
        { email: { email_count: 20, opened_count: 12, created_at: "2026-11-18T00:00:00.000Z" }, count: { clicks: 3 }, tags: [{ slug: "regulars" }] },
        { email: { email_count: 5, opened_count: 2, created_at: "2026-11-19T00:00:00.000Z" }, count: { clicks: 0 }, tags: [] },
      ],
    );
    const ran = await run("--week", "2026-11-16");

    expect(ran.code).toBe(0);
    expect(ran.stdout).toContain("new subscribers=1 (ghost coffee-shop new members)");
    expect(ran.stdout).toContain("opens=14 (ghost coffee-shop email opens)");
    expect(ran.stdout).toContain("opens [Regulars]=12 (ghost coffee-shop email opens, tagged regulars)");
    expect(ran.stdout).toContain("not read: nudge opens");
    expect(ran.stdout).toContain('dfm-ledger:counts-record --count "new subscribers=1" --count "opens=14" --count "opens [Regulars]=12"');
    expect(await readFile(join(folder, "ledger.txt"), "utf8")).toBe(LEDGER);

    const asked = (await readFile(join(folder, "fake-ghost-numbers-requests.jsonl"), "utf8")).trim().split("\n").map((line) => JSON.parse(line));
    expect(asked.every((each: { url: string }) => each.url.startsWith("https://coffee-shop.example/ghost/api/admin/"))).toBe(true);
    expect(asked[0].authorization).toMatch(/^Ghost [\w-]+\.[\w-]+\.[\w-]+$/);
  });

  it("says to run site-add when settings have no Ghost line", async () => {
    await writeFile(join(folder, "settings.txt"), "spec 1\ntime zone: Australia/Melbourne\n");
    await ghostHas([], []);
    const ran = await run();
    expect(ran.code).toBe(2);
    expect(ran.stderr).toContain("No Ghost line for coffee-shop in settings: run dfm-ghost:site-add for it");
  });

  it("passes on Ghost's refusal and never prints the key", async () => {
    await ghostHas([], [], 401);
    const ran = await run();
    expect(ran.code).toBe(2);
    expect(ran.stderr).toContain("Ghost at https://coffee-shop.example said 401");
    expect(ran.stdout + ran.stderr).not.toContain(ADMIN_KEY.split(":")[1]);
  });
});
