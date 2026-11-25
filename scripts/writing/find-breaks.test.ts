import { describe, expect, it } from "vitest";
import { findBreaks } from "./find-breaks.ts";

describe("findBreaks", () => {
  it("finds nothing in plain coffee shop text", () => {
    const text = "The coffee shop opens at seven and closes at three.\nRegulars come back weekly.";
    expect(findBreaks(text)).toEqual([]);
  });

  it("finds an em dash", () => {
    const breaks = findBreaks("Oat milk \u2014 always.");
    expect(breaks.map((found) => found.rule)).toEqual(["em dash"]);
  });

  it("finds a comma before and, but, so or or", () => {
    const text = "Coffee, and cake.\nOpen, but busy.\nRained, so quiet.\nTea, or coffee.";
    const breaks = findBreaks(text);
    expect(breaks.map((found) => found.line)).toEqual([1, 2, 3, 4]);
  });

  it("allows a comma before other words", () => {
    expect(findBreaks("Coffee, cake and tea. Sandwiches, organic ones.")).toEqual([]);
  });

  it("finds an emoji", () => {
    const breaks = findBreaks("Fresh beans \u{2615} today");
    expect(breaks.map((found) => found.rule)).toEqual(["not plain ASCII"]);
  });

  it("finds symbols and accents: anything outside plain ASCII", () => {
    const text = "\u00A9 2026, caf\u00E9, open \u2192 visits, 3 \u00F7 2";
    expect(findBreaks(text).map((found) => found.rule)).toEqual([
      "not plain ASCII",
      "not plain ASCII",
      "not plain ASCII",
      "not plain ASCII",
    ]);
  });

  it("finds an em dash once, by its own rule", () => {
    expect(findBreaks("coffee \u2014 cake").map((found) => found.rule)).toEqual(["em dash"]);
  });

  it("gives the line of each break", () => {
    const breaks = findBreaks("line one\nline two \u2014 here");
    expect(breaks[0].line).toBe(2);
  });

  it("finds a comma at the end of a line before a joining word on the next", () => {
    const breaks = findBreaks("Coffee, cake,\nand tea.");
    expect(breaks.map((found) => [found.line, found.rule])).toEqual([[1, "comma before a joining word"]]);
  });

  it("finds it across two comment lines too", () => {
    const breaks = findBreaks("// the beans are roasted,\n// and then ground");
    expect(breaks.map((found) => found.line)).toEqual([1]);
  });

  it("allows a comma at the end of a line before other words", () => {
    expect(findBreaks("Coffee, cake,\nscones.")).toEqual([]);
  });
});
