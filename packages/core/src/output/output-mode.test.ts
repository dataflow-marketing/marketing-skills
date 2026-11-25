import { describe, expect, it } from "vitest";
import { outputMode } from "./output-mode.ts";

describe("outputMode", () => {
  it("is text by default", () => {
    expect(outputMode(["settings.txt"])).toBe("text");
  });

  it("is json with --json", () => {
    expect(outputMode(["settings.txt", "--json"])).toBe("json");
  });
});
