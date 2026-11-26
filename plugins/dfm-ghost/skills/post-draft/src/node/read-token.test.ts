import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { readToken } from "./read-token.ts";
import { COFFEE_SHOP_ADMIN_KEY, COFFEE_SHOP_KEYS, COFFEE_SHOP_SITE } from "../../../../fixtures/coffee-shop.ts";

describe("readToken", () => {
  it("makes a token from the key and gives back only the token", async () => {
    const folder = await mkdtemp(join(tmpdir(), "dfm-token-"));
    await writeFile(join(folder, ".env"), COFFEE_SHOP_KEYS);

    const made = await readToken({ site: COFFEE_SHOP_SITE, keysFile: join(folder, ".env") });
    expect(made.ok).toBe(true);
    expect(made.ok && made.token.split(".").length).toBe(3);
    expect(JSON.stringify(made)).not.toContain(COFFEE_SHOP_ADMIN_KEY);
  });

  it("names the variable when the key is missing or the file cannot be read", async () => {
    const folder = await mkdtemp(join(tmpdir(), "dfm-token-"));
    await writeFile(join(folder, ".env"), "OTHER_KEY=1\n");

    const missing = await readToken({ site: COFFEE_SHOP_SITE, keysFile: join(folder, ".env") });
    expect(missing).toEqual({ ok: false, problem: "No key named COFFEE_SHOP_GHOST_ADMIN_KEY. Add it to the keys file named in settings." });

    const noFile = await readToken({ site: COFFEE_SHOP_SITE, keysFile: join(folder, "none.env") });
    expect(noFile.ok).toBe(false);
  });
});
