// objects-read's dist/run.js, run with Node alone against the fake Ghost: no real Ghost is ever called.

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { LEDGER, OWNER_EMAIL, coffeeShopFolder } from "../../../fixtures/coffee-shop.ts";
import { runScript } from "../../../fixtures/run-script.ts";

const SCRIPT = fileURLToPath(new URL("../dist/run.js", import.meta.url));
const MORE_STORES = "store files: file stores\nbinding ledger bakery: files bakery.txt\nbinding profile bakery: files bakery-profile.txt\n";

function objectsRead(folder: string, ...more: string[]) {
  return runScript(SCRIPT, ["--settings", "settings.txt", ...more], { cwd: folder, fakeGhostFolder: folder });
}

async function folderWithTwoLedgers(): Promise<string> {
  const folder = await coffeeShopFolder(undefined, MORE_STORES);
  await mkdir(join(folder, "stores"));
  await writeFile(join(folder, "stores", "bakery.txt"), "spec 1\ngoal: 40 loaves\n");
  return folder;
}

describe("objects-read", () => {
  it("lists every ledger in settings with where it is and its version", async () => {
    const folder = await folderWithTwoLedgers();
    const ran = await objectsRead(folder, "--object", "ledger");
    expect(ran.code).toBe(0);
    expect(ran.stdout).toContain("ledger: 2 in settings");
    expect(ran.stdout).toContain("ledger of bakery (2 lines)\n  where: file stores/bakery.txt\n  version: ");
    expect(ran.stdout).toContain(`ledger of coffee-shop (2 lines)\n  where: ghost coffee-shop member ${OWNER_EMAIL} field next`);
    expect(ran.stdout.match(/version: [0-9a-f]{64}/g)).toHaveLength(2);
    expect(ran.stdout.indexOf("bakery")).toBeLessThan(ran.stdout.indexOf("coffee-shop"));
  });

  it("prints no object's text and writes nothing", async () => {
    const folder = await folderWithTwoLedgers();
    const ran = await objectsRead(folder, "--object", "ledger");
    expect(ran.stdout).not.toContain("goal:");
    const saved = JSON.parse(await readFile(join(folder, "fake-ghost-members.json"), "utf8"));
    expect(saved.members[0].custom.next).toBe(LEDGER);
    const requests = await readFile(join(folder, "fake-ghost-requests.jsonl"), "utf8");
    expect(requests).not.toContain('"method":"PUT"');
  });

  it("lists only the kind asked for: an empty one says so", async () => {
    const folder = await folderWithTwoLedgers();
    const ran = await objectsRead(folder, "--object", "profile");
    expect(ran.code).toBe(0);
    expect(ran.stdout).toContain("profile: 1 in settings\n\nprofile of bakery (empty)\n  where: file stores/bakery-profile.txt\n  version: none");
  });

  it("names each object that cannot be read and exits 1", async () => {
    const folder = await coffeeShopFolder([], MORE_STORES);
    const ran = await objectsRead(folder, "--object", "ledger");
    expect(ran.code).toBe(1);
    expect(ran.stdout).toContain(`ledger of coffee-shop: cannot be read\n  problem: No member on https://coffee-shop.example has the email ${OWNER_EMAIL}.`);
    expect(ran.stdout).toContain("ledger of bakery (empty)");
  });

  it("says where an object is kept when settings bind none of the kind", async () => {
    const folder = await coffeeShopFolder();
    const ran = await objectsRead(folder, "--object", "forecast");
    expect(ran.code).toBe(0);
    expect(ran.stdout).toContain("No forecast is bound in settings.");
  });

  it("gives data with --json", async () => {
    const folder = await folderWithTwoLedgers();
    const ran = await objectsRead(folder, "--object", "ledger", "--json");
    const data = JSON.parse(ran.stdout);
    expect(data.objects.map((each: { business: string }) => each.business)).toEqual(["bakery", "coffee-shop"]);
  });

  it("refuses with no kind", async () => {
    const folder = await coffeeShopFolder();
    const ran = await objectsRead(folder);
    expect(ran.code).toBe(2);
    expect(ran.stderr).toContain("Missing --object");
  });

  it("never prints the key", async () => {
    const folder = await folderWithTwoLedgers();
    const ran = await objectsRead(folder, "--object", "ledger");
    expect(`${ran.stdout}${ran.stderr}`).not.toContain("0123456789abcdef0123456789abcdef");
  });
});
