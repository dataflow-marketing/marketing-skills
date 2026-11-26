import { describe, expect, it } from "vitest";
import { isModeFlag, writeMode } from "./write-mode.ts";

describe("writeMode", () => {
  it("previews when no mode is named", () => {
    expect(writeMode(["--site", "coffee-shop"])).toEqual({ ok: true, mode: "preview" });
  });

  it("reads each mode", () => {
    expect(writeMode(["--preview"])).toEqual({ ok: true, mode: "preview" });
    expect(writeMode(["--go"])).toEqual({ ok: true, mode: "go" });
    expect(writeMode(["--read-back"])).toEqual({ ok: true, mode: "read-back" });
  });

  it("refuses two modes at once", () => {
    expect(writeMode(["--preview", "--go"]).ok).toBe(false);
  });
});

describe("isModeFlag", () => {
  it("knows the three modes and nothing else", () => {
    expect(isModeFlag("--go")).toBe(true);
    expect(isModeFlag("--json")).toBe(false);
  });
});
