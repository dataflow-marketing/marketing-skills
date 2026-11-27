import { describe, expect, it } from "vitest";
import { overTime, overTimeText, sideBySideText } from "./compare.ts";
import { profileParts } from "./profile-parts.ts";

const BEFORE = [
  "spec 1",
  "=== counted ===",
  "pages: 3, posts: 1 (in the sitemap)",
  "=== read from the site ===",
  "what it offers:",
  "Coffee from 6.30. Plant milk is 50 cents extra.",
  "",
  "proof they show:",
  "None on the site.",
  "how they write:",
  '"We open at 6.30." [Home]',
].join("\n");

const AFTER = BEFORE.replace("Plant milk is 50 cents extra.", "Plant milk costs nothing extra.").replace("posts: 1", "posts: 2");

describe("profileParts", () => {
  it("reads each part's lines by its label, the counted lines too", () => {
    const parts = profileParts(BEFORE);
    expect(parts.get("counted")).toEqual(["pages: 3, posts: 1 (in the sitemap)"]);
    expect(parts.get("what it offers")).toEqual(["Coffee from 6.30. Plant milk is 50 cents extra."]);
    expect(parts.get("how they write")).toEqual(['"We open at 6.30." [Home]']);
  });
});

describe("overTime", () => {
  it("names each sentence that went and came, part by part", () => {
    const result = overTime(BEFORE, AFTER);
    expect(result.changed).toEqual([
      { part: "counted", out: ["pages: 3, posts: 1 (in the sitemap)"], in: ["pages: 3, posts: 2 (in the sitemap)"] },
      { part: "what it offers", out: ["Plant milk is 50 cents extra."], in: ["Plant milk costs nothing extra."] },
    ]);
    expect(result.same).toContain("proof they show");
  });

  it("writes the changes for a person to read", () => {
    const text = overTimeText({ before: "month 1", after: "month 2" }, overTime(BEFORE, AFTER));
    expect(text).toContain("what it offers:\n- Plant milk is 50 cents extra.\n+ Plant milk costs nothing extra.");
    expect(text).toContain("the same: 14 of 16 parts");
  });

  it("says when nothing changed", () => {
    expect(overTimeText({ before: "a", after: "b" }, overTime(BEFORE, BEFORE))).toContain("nothing changed");
  });
});

describe("sideBySideText", () => {
  it("lines up each part across the profiles", () => {
    const text = sideBySideText([
      { name: "one", text: BEFORE },
      { name: "two", text: AFTER },
    ]);
    expect(text).toContain("## what it offers\none: Coffee from 6.30. Plant milk is 50 cents extra.\ntwo: Coffee from 6.30. Plant milk costs nothing extra.");
    expect(text).toContain("## who is behind it\none: (nothing)\ntwo: (nothing)");
  });
});
