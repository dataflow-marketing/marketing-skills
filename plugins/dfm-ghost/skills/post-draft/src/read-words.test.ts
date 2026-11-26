import { describe, expect, it } from "vitest";
import { readWords } from "./read-words.ts";
import { ICED_COFFEE_WORDS } from "../../../fixtures/coffee-shop.ts";

describe("readWords", () => {
  it("reads the fields and the body's paragraphs", () => {
    const read = readWords(ICED_COFFEE_WORDS);
    expect(read.ok).toBe(true);
    if (!read.ok) {
      return;
    }
    expect(read.words.title).toBe("Iced coffee is back");
    expect(read.words.from).toBe("recordings/2026-11-28-sam.txt");
    expect(read.words.tags).toEqual(["menu", "summer"]);
    expect(read.words.paragraphs.length).toBe(2);
  });

  it("names every problem: a missing spec line, an unknown field and missing required fields", () => {
    // line 1 must be the spec line: a field written there is not read either
    const read = readWords("kind: post\nstate: draft\ncolour: blue\ntitle: Hi\n=== body ===\nHello.\n");
    expect(read.ok).toBe(false);
    expect(!read.ok && read.problems).toEqual([
      'line 1: expected "spec 1"',
      "line 3: not understood: colour: blue",
      "no kind: it is required",
      "no channel: it is required",
      "no from: it is required",
    ]);
  });

  it("refuses a file with no body line", () => {
    expect(readWords("spec 1\nkind: post\n").ok).toBe(false);
  });

  it("needs a title for a post", () => {
    const read = readWords("spec 1\nkind: post\nstate: draft\nchannel: website\nfrom: notes.txt\n=== body ===\nHello.\n");
    expect(!read.ok && read.problems).toEqual(["no title: a post needs one"]);
  });
});
