// The coffee shop: made up, like everything in examples/coffee-shop.
// No address here is a real site, no email a real person and no key a real key.

import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { FakeMember } from "../../../packages/store/fixtures/fake-ghost-members.ts";
import { FAKE_REST_ADDRESS, FAKE_REST_KEY } from "../../../packages/store/fixtures/fake-rest-store.ts";

export const KEY_NAME = "COFFEE_SHOP_GHOST_ADMIN_KEY";
export const ADMIN_KEY = "c0ffeec0ffeec0ffeec0ffee:0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
export const OWNER_EMAIL = "owner@coffee-shop.example";
export const LEDGER = "spec 1\ngoal: 100 regulars\n";

export function settingsText(more = ""): string {
  return `spec 1
time zone: Australia/Melbourne
site coffee-shop: ghost https://coffee-shop.example key in ${KEY_NAME}
keys file: .env
store members: ghost coffee-shop
binding ledger coffee-shop: members ${OWNER_EMAIL} next
${more}`;
}

// A working folder with settings, a keys file and the fake Ghost's members, ready for a skill to run in
export async function coffeeShopFolder(members?: FakeMember[], more = ""): Promise<string> {
  const folder = await mkdtemp(join(tmpdir(), "dfm-store-"));
  await writeFile(join(folder, "settings.txt"), settingsText(more));
  await writeFile(join(folder, ".env"), `${KEY_NAME}=${ADMIN_KEY}\n`);
  const owner: FakeMember = { id: "m1", email: OWNER_EMAIL, custom: { next: LEDGER } };
  await writeFile(join(folder, "fake-ghost-members.json"), JSON.stringify({ members: members ?? [owner], fields: ["next"] }));
  return folder;
}

export const REST_KEY_NAME = "COFFEE_SHOP_STORE_KEY";

// The coffee shop's ledger kept in the fake rest store instead: settings name a rest store and bind the ledger to
// it by the business's name. ledger is what the store keeps at the start (null for an object not kept yet).
export async function coffeeShopRestFolder(ledger: string | null = LEDGER, limit = 1000): Promise<string> {
  const folder = await coffeeShopFolder();
  const settings = `spec 1
time zone: Australia/Melbourne
keys file: .env
store api: rest ${FAKE_REST_ADDRESS} key in ${REST_KEY_NAME}
binding ledger coffee-shop: api coffee-shop
`;
  await writeFile(join(folder, "settings.txt"), settings);
  await writeFile(join(folder, ".env"), `${REST_KEY_NAME}=${FAKE_REST_KEY}\n`);
  const objects = ledger === null ? [] : [{ kind: "ledger", id: "coffee-shop", version: "v1", body: ledger }];
  await writeFile(join(folder, "fake-rest-objects.json"), JSON.stringify({ limit, written: objects.length, objects }));
  return folder;
}
