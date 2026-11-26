import { describe, expect, it } from "vitest";
import { newStamp } from "./stamp.ts";

describe("newStamp", () => {
  it("gives a fresh version every time", () => {
    expect(newStamp().version).not.toBe(newStamp().version);
  });

  it("gives the time of the write", () => {
    expect(newStamp().updated).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});
