import { describe, expect, it } from "vitest";
import { bearerKey } from "./bearer-key.ts";

describe("bearerKey", () => {
  it("takes the key from a Bearer header", () => {
    expect(bearerKey("Bearer example-store-key")).toBe("example-store-key");
  });

  it("gives null for no header or another scheme", () => {
    expect(bearerKey(undefined)).toBeNull();
    expect(bearerKey("Basic abc")).toBeNull();
    expect(bearerKey("Bearer")).toBeNull();
  });
});
