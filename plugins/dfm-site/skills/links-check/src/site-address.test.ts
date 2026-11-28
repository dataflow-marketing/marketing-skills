import { describe, expect, it } from "vitest";
import { siteAddress } from "./site-address.ts";

describe("siteAddress", () => {
  it("takes https and a site on this computer, by its origin", () => {
    expect(siteAddress("https://coffee-shop.example/about/")).toEqual({ ok: true, origin: "https://coffee-shop.example" });
    expect(siteAddress("http://localhost:4104")).toEqual({ ok: true, origin: "http://localhost:4104" });
  });

  it("refuses plain http elsewhere and what is not an address", () => {
    expect(siteAddress("http://coffee-shop.example").ok).toBe(false);
    expect(siteAddress("coffee shop").ok).toBe(false);
  });
});
