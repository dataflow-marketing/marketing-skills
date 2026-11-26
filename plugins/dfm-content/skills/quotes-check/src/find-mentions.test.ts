import { describe, expect, it } from "vitest";
import { findMentions } from "./find-mentions.ts";

describe("findMentions", () => {
  it("counts each thing once, by what found it first", () => {
    const mentions = findMentions(['Our barista Sam says "the tenth coffee is on us" for $5.50 since 1987.']);
    expect(mentions.map((mention) => [mention.kind, mention.written])).toEqual([
      ["quote", '"the tenth coffee is on us"'],
      ["money", "$5.50"],
      ["number", "1987"],
      ["name", "Sam"],
    ]);
  });

  it("does not check a web address", () => {
    expect(findMentions(["See https://coffee-shop.example/Menu/2026 for more."])).toEqual([]);
  });

  it("turns a quote mark with no pair into a claim to read", () => {
    const mentions = findMentions(["", 'They said "free coffee']);
    expect(mentions).toEqual([
      { kind: "claim", written: "a quote mark with no pair on line 2 of the text", key: "a quote mark with no pair on line 2 of the text", textLine: 2 },
    ]);
  });
});
