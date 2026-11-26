import { describe, expect, it } from "vitest";
import { contentLines } from "./content-lines.ts";

describe("contentLines", () => {
  it("blanks the spec line and section markers, keeping the line numbers", () => {
    const lines = contentLines("spec 1\n=== counted ===\npages: 3");
    expect(lines).toEqual(["", "", "pages: 3"]);
  });

  it("blanks the fields of a words file that are not writing", () => {
    const words = [
      "spec 1",
      "kind: post",
      "title: Iced coffee is back",
      "link: https://coffee-shop.example/iced-coffee/",
      "from: recordings/2026-11-28-sam.txt",
      "=== body ===",
      "Iced coffee is back from Monday.",
    ].join("\n");
    expect(contentLines(words)).toEqual(["", "", "title: Iced coffee is back", "", "", "", "Iced coffee is back from Monday."]);
  });

  it("keeps a line that only looks like a field when there is no body", () => {
    expect(contentLines("from: the bakery next door")).toEqual(["from: the bakery next door"]);
  });
});
