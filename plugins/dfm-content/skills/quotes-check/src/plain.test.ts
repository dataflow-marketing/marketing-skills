import { describe, expect, it } from "vitest";
import { plain } from "./plain.ts";

describe("plain", () => {
  it("makes both sides of a match the same", () => {
    expect(plain("\u201CThe  **tenth** coffee\u201D is [on us](https://coffee-shop.example/)")).toBe('"the tenth coffee" is on us');
  });
});
