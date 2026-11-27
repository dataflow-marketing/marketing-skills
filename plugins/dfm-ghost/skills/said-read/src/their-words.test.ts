import { describe, expect, it } from "vitest";
import { theirWords } from "./their-words.ts";

describe("theirWords", () => {
  it("takes the excerpt they wrote, trimmed", () => {
    expect(theirWords({ custom_excerpt: "  Their own words.  ", plaintext: "Something else. Entirely." })).toBe("Their own words.");
  });

  it("falls back to the post's words when the excerpt is only spaces", () => {
    expect(theirWords({ custom_excerpt: "   ", plaintext: "First. Second. Third." })).toBe("First. Second.");
  });

  it("takes the post's first two sentences with its spacing tidied", () => {
    const plaintext = "Most cups are small.\n\nA large one costs more!  Then they grow? Third sentence.";
    expect(theirWords({ plaintext })).toBe("Most cups are small. A large one costs more!");
  });

  it("gives one sentence or none as it is", () => {
    expect(theirWords({ plaintext: "Only one sentence." })).toBe("Only one sentence.");
    expect(theirWords({ plaintext: "No full stop at all" })).toBe("No full stop at all");
    expect(theirWords({})).toBe("");
  });

  it("is 300 characters at most", () => {
    expect(theirWords({ plaintext: "word ".repeat(100).trim() })).toHaveLength(300);
  });

  it("needs a space after a stop to end a sentence; a short form such as e.g. never ends one", () => {
    expect(theirWords({ plaintext: "It costs 3.5 dollars. Cheap. More." })).toBe("It costs 3.5 dollars. Cheap.");
    expect(theirWords({ plaintext: "Use e.g. a grinder. Then brew. More." })).toBe("Use e.g. a grinder. Then brew.");
  });

  it("ends a sentence at etc. like any other stop", () => {
    expect(theirWords({ plaintext: "We do lattes, mochas etc. Come in any day. More." })).toBe("We do lattes, mochas etc. Come in any day.");
  });
});
