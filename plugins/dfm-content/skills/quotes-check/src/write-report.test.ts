import { describe, expect, it } from "vitest";
import { checkText } from "./check-text.ts";
import { writeReport } from "./write-report.ts";
import { COFFEE_SHOP_SITE, DRAFT_WITH_INVENTIONS } from "../../../fixtures/coffee-shop.ts";

describe("writeReport", () => {
  const result = checkText(DRAFT_WITH_INVENTIONS, [{ name: "site.txt", text: COFFEE_SHOP_SITE }]);
  const report = writeReport({ checked: "drafts/iced-coffee.txt", against: ["site.txt"] }, result);

  it("writes the spec shape for a person", () => {
    expect(report.text).toBe(
      [
        "spec 1",
        "checked: drafts/iced-coffee.txt",
        "against: site.txt",
        "result: 4 problems",
        "",
        'quote not found: "Best iced coffee in town,"',
        "name found: Monday (line 23)",
        "name not found: Sam",
        "number not found: 1987",
        "number not found: $5.50",
      ].join("\n"),
    );
  });

  it("gives the same as data for --json", () => {
    expect(report.data).toMatchObject({ spec: 1, result: "problems", problems: 4, against: ["site.txt"] });
  });

  it("says passed when nothing is missing", () => {
    const passed = writeReport({ checked: "a.txt", against: ["b.txt"] }, { lines: [], problems: 0 });
    expect(passed.text).toContain("result: passed");
  });
});
