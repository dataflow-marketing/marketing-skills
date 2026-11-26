import { describe, expect, it } from "vitest";
import { parseGraphLine, parsePlanLine } from "./parse-line.ts";

describe("parseGraphLine", () => {
  it("reads a link written with the ASCII arrow and with the Unicode one alike", () => {
    const ascii = parseGraphLine("new post -> visits: ? (unknown)");
    const unicode = parseGraphLine("new post \u2192 visits: ? (unknown)");
    expect(ascii).toBeDefined();
    expect(ascii).toEqual(unicode);
  });

  it("keeps a hyphen inside a name", () => {
    const shape = parseGraphLine("check-in -> visits: ? (unknown)") as { from?: { name: string }[] } | undefined;
    expect(shape?.from?.[0].name).toBe("check-in");
  });

  it("gives back nothing for a line it cannot read", () => {
    expect(parseGraphLine("new post -> visits")).toBeUndefined();
  });
});

describe("parsePlanLine", () => {
  it("reads a step taken off with the minus sign or a hyphen alike", () => {
    expect(parsePlanLine("2026-11-23 - flyer drop")).toEqual(parsePlanLine("2026-11-23 \u2212 flyer drop"));
  });
});
