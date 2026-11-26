import { describe, expect, it } from "vitest";
import { findNumberWords } from "./number-words.ts";

describe("findNumberWords", () => {
  it("joins the words of one number", () => {
    const found = findNumberWords("twenty five cups, twenty-five cups, one hundred and fifty cups");
    expect(found.map((number) => number.value)).toEqual([25, 25, 150]);
  });

  it("keeps two numbers apart when they are not joined", () => {
    const found = findNumberWords("one or two sentences, one and two");
    expect(found.map((number) => number.value)).toEqual([1, 2, 1, 2]);
  });

  it("does not read a number inside a word", () => {
    expect(findNumberWords("someone often")).toEqual([]);
  });
});
