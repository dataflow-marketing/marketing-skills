import { describe, expect, it } from "vitest";
import { readArgs } from "./read-args.ts";

describe("readArgs", () => {
  it("reads the address and keeps what was read in site/ unless a folder is named", () => {
    expect(readArgs(["--address", "https://coffee-shop.example", "--json"])).toEqual({
      ok: true,
      args: { address: "https://coffee-shop.example", folder: "site", fromSitemap: false },
    });
    const named = readArgs(["--address", "https://coffee-shop.example", "--folder", "read"]);
    expect(named.ok && named.args.folder).toBe("read");
  });

  it("needs the address and refuses what it does not understand", () => {
    expect(readArgs([]).ok).toBe(false);
    expect(readArgs(["--address", "https://coffee-shop.example", "--go"]).ok).toBe(false);
  });

  it("reads --from-sitemap", () => {
    const read = readArgs(["--address", "https://coffee-shop.example", "--from-sitemap"]);
    expect(read.ok && read.args.fromSitemap).toBe(true);
  });
});
