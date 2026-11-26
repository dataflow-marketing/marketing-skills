import { describe, expect, it } from "vitest";
import { indexSources } from "./index-sources.ts";

const index = indexSources([
  { name: "notes.txt", text: "Iced coffee is back\n\nfrom Monday, $5.50 a cup.\nThree cakes." },
]);

describe("indexSources", () => {
  it("joins the lines of a source into one plain text, keeping where each line starts", () => {
    const source = index.searchable[0];
    expect(source.name).toBe("notes.txt");
    expect(source.lineStarts.map((start) => start.line)).toEqual([1, 3, 4]);
    expect(source.text.slice(source.lineStarts[1].offset)).toMatch(/^from monday/);
  });

  it("keeps every number and amount of money with the line it is first on", () => {
    expect(index.numbers.get("3")).toEqual({ source: "notes.txt", line: 4 });
    expect([...index.money.values()]).toContainEqual({ source: "notes.txt", line: 3 });
  });
});
