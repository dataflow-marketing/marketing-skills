import { readLedger } from "@dataflow-marketing/ledger/read";
import { describe, expect, it } from "vitest";
import { contentLines } from "./content-lines.ts";

describe("contentLines", () => {
  it("says who this week's content was for, from its said lines", () => {
    const read = readLedger(
      'spec 1\n=== done ===\n2026-11-30 said on Instagram on 2026-12-01: "Iced coffee" https://coffee-shop.example/a/ [Regulars] summary: "Back."\n2026-11-30 counted to 2026-12-02\n',
    );
    expect(contentLines(read.done!)).toEqual(["this week's content was for: Regulars (calculated)"]);
  });
});
