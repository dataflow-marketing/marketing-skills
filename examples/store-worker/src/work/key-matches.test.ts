import { describe, expect, it } from "vitest";
import { keyMatches } from "./key-matches.ts";

describe("keyMatches", () => {
  it("matches only the same key", async () => {
    expect(await keyMatches("example-store-key", "example-store-key")).toBe(true);
    expect(await keyMatches("example-store-ke", "example-store-key")).toBe(false);
    expect(await keyMatches("", "example-store-key")).toBe(false);
  });
});
