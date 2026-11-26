import { describe, expect, it } from "vitest";
import { findNames } from "./find-names.ts";

function names(line: string): string[] {
  return findNames(line).map((name) => name.written);
}

describe("findNames", () => {
  it("finds a capital inside a sentence", () => {
    expect(names("Follow the shop on Instagram.")).toEqual(["Instagram"]);
  });

  it("skips a capital that starts a sentence, a line, a list item or a bracket", () => {
    expect(names("Cake comes first. Then coffee: Takeaway only.")).toEqual([]);
    expect(names("- Banana bread on Fridays")).toEqual(["Fridays"]);
    expect(names("(Made up for this example.)")).toEqual([]);
  });

  it("keeps a name with an apostrophe", () => {
    expect(names("Ask for Sam's iced coffee.")).toEqual(["Sam"]);
  });

  it("reads a capital with an accent", () => {
    expect(names("Our new Caf\u00E9 opens.")).toEqual(["Caf\u00E9"]);
  });

  it("skips a capital that starts a quote: the quote is checked whole", () => {
    expect(names('The site lists them under "The people so far" on Fridays.')).toEqual(["Fridays"]);
  });

  it("still finds a page's name inside a sentence", () => {
    expect(names("The four pages are About and Policies.")).toEqual(["About", "Policies"]);
  });
});
