import { describe, expect, it } from "vitest";
import { isLocalAddress } from "./local-address.ts";

describe("isLocalAddress", () => {
  it("is true for http on localhost or 127.0.0.1, with any port", () => {
    expect(isLocalAddress(new URL("http://localhost:4101/"))).toBe(true);
    expect(isLocalAddress(new URL("http://127.0.0.1"))).toBe(true);
  });

  it("is false for any other host; also for https", () => {
    expect(isLocalAddress(new URL("http://coffee-shop.example"))).toBe(false);
    expect(isLocalAddress(new URL("https://localhost:4101"))).toBe(false);
  });
});
