import { describe, expect, it } from "vitest";
import { headersFor, limitsUrl, objectUrl, objectsUrl } from "./rest-calls.ts";

describe("the rest calls", () => {
  it("name the contract's paths", () => {
    expect(objectsUrl("https://store.example", "ledger")).toBe("https://store.example/objects/ledger");
    expect(objectUrl("https://store.example", "ledger", "coffee-shop")).toBe("https://store.example/objects/ledger/coffee-shop");
    expect(limitsUrl("https://store.example")).toBe("https://store.example/limits");
  });

  it("send the key as a Bearer key and the version read in If-Match", () => {
    expect(headersFor("k", true, "v3")).toEqual({
      Authorization: "Bearer k",
      Accept: "application/json",
      "Content-Type": "application/json",
      "If-Match": "v3",
    });
    expect(headersFor("k")).toEqual({ Authorization: "Bearer k", Accept: "application/json" });
  });
});
