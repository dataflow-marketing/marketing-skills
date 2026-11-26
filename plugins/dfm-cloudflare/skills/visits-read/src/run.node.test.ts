// dfm-cloudflare:visits-read's dist/run.js run as Claude runs it, against the fake Cloudflare.

import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { runScript } from "../../../fixtures/run-script.ts";

const SCRIPT = fileURLToPath(new URL("../dist/run.js", import.meta.url));
const ACCOUNT = "0123456789abcdef0123456789abcdef";
const TOKEN = "example-cloudflare-token";
const LEDGER = [
  "=== graph ===",
  "fact site visits: cloudflare coffee-shop.example visits",
  "fact pages viewed: cloudflare coffee-shop.example views",
  "fact found the site: cloudflare coffee-shop.example outside",
  "fact cups served: told",
  "",
].join("\n");
const made: string[] = [];
let folder = "";

function settingsWith(siteLine: string): string {
  return ["spec 1", "time zone: Australia/Melbourne", siteLine, `keys file: ${join(folder, "keys.env")}`, ""].join("\n");
}

async function cloudflareAnswers(status: number, body: unknown): Promise<void> {
  await writeFile(join(folder, "fake-cloudflare-answer.json"), JSON.stringify({ status, body }));
}

function groups(...rows: { views: number; visits: number; from: string; sample?: number }[]) {
  const answer = rows.map((row) => ({ count: row.views, sum: { visits: row.visits }, avg: { sampleInterval: row.sample ?? 1 }, dimensions: { refererHost: row.from } }));
  return { data: { viewer: { accounts: [{ rumPageloadEventsAdaptiveGroups: answer }] } } };
}

function run(...more: string[]) {
  return runScript(SCRIPT, ["--ledger", "ledger.txt", "--settings", "settings.txt", ...more], { cwd: folder, fakeCloudflareFolder: folder });
}

beforeEach(async () => {
  folder = await mkdtemp(join(tmpdir(), "dfm-visits-read-"));
  made.push(folder);
  await writeFile(join(folder, "ledger.txt"), LEDGER);
  await writeFile(join(folder, "settings.txt"), settingsWith(`site coffee-shop: cloudflare coffee-shop.example account ${ACCOUNT} key in CLOUDFLARE_API_TOKEN`));
  await writeFile(join(folder, "keys.env"), `CLOUDFLARE_API_TOKEN=${TOKEN}\n`);
});

afterAll(async () => {
  for (const each of made) {
    await rm(each, { recursive: true, force: true });
  }
});

describe("dfm-cloudflare:visits-read dist/run.js", () => {
  it("reads every Cloudflare fact for a week gone by with one question and writes nothing", async () => {
    await cloudflareAnswers(200, groups({ views: 10, visits: 6, from: "" }, { views: 3, visits: 3, from: "www.google.com" }));
    const ran = await run("--week", "2026-11-16");

    expect(ran.code).toBe(0);
    expect(ran.stdout).toContain("week of 2026-11-16: the whole week (Australia/Melbourne)");
    expect(ran.stdout).toContain("site visits=9 (cloudflare coffee-shop.example visits)");
    expect(ran.stdout).toContain("pages viewed=13 (cloudflare coffee-shop.example views)");
    expect(ran.stdout).toContain("found the site=3 (cloudflare coffee-shop.example outside)");
    expect(ran.stdout).not.toContain("cups served");
    expect(await readFile(join(folder, "ledger.txt"), "utf8")).toBe(LEDGER);

    const asked = (await readFile(join(folder, "fake-cloudflare-requests.jsonl"), "utf8")).trim().split("\n").map((line) => JSON.parse(line));
    expect(asked).toHaveLength(1);
    expect(asked[0].authorization).toBe(`Bearer ${TOKEN}`);
    expect(asked[0].body.variables).toEqual({
      account: ACCOUNT,
      from: "2026-11-15T13:00:00.000Z",
      to: "2026-11-22T13:00:00.000Z",
      hosts: ["coffee-shop.example", "www.coffee-shop.example"],
    });
  });

  it("gives the counts-record line as data with --json", async () => {
    await cloudflareAnswers(200, groups({ views: 5, visits: 5, from: "" }));
    const ran = await run("--week", "2026-11-16", "--json");
    expect(ran.code).toBe(0);
    expect(JSON.parse(ran.stdout).countArgs).toEqual(["site visits=5", "pages viewed=5", "found the site=0"]);
  });

  it("refuses with the line to add when settings have no Cloudflare line", async () => {
    await writeFile(join(folder, "settings.txt"), settingsWith("site coffee-shop: public https://coffee-shop.example"));
    await cloudflareAnswers(200, groups());
    const ran = await run();
    expect(ran.code).toBe(2);
    expect(ran.stderr).toContain('add "site <name>: cloudflare coffee-shop.example account <account id> key in <NAME>"');
  });

  it("names a missing key without printing any key", async () => {
    await writeFile(join(folder, "keys.env"), "OTHER_KEY=x\n");
    await cloudflareAnswers(200, groups());
    const ran = await run();
    expect(ran.code).toBe(2);
    expect(ran.stderr).toContain("No key named CLOUDFLARE_API_TOKEN");
  });

  it("passes on Cloudflare's refusal and never prints the token", async () => {
    await cloudflareAnswers(200, { errors: [{ message: "not authorized for that account" }] });
    const ran = await run();
    expect(ran.code).toBe(2);
    expect(ran.stderr).toContain("not authorized for that account");
    expect(ran.stdout + ran.stderr).not.toContain(TOKEN);
  });

  it("refuses a week that has not begun", async () => {
    await cloudflareAnswers(200, groups());
    const ran = await run("--week", "2099-01-05");
    expect(ran.code).toBe(2);
    expect(ran.stderr).toContain("The week of 2099-01-05 has not begun");
  });
});
