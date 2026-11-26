import { describe, expect, it } from "vitest";
import { compareWithSources } from "./compare-with-sources.ts";
import { indexSources } from "./index-sources.ts";
import type { Mention } from "./types.ts";

const index = indexSources([{ name: "notes.txt", text: "Sam said iced coffee is back from Monday." }]);

function mention(kind: Mention["kind"], written: string, key = written.toLowerCase()): Mention {
  return { kind, written, key, textLine: 1 };
}

describe("compareWithSources", () => {
  it("says where each mention was found and which were not", () => {
    const lines = compareWithSources([mention("name", "Monday"), mention("name", "Friday")], index);
    expect(lines).toEqual([
      { kind: "name", written: "Monday", found: true, where: { source: "notes.txt", line: 1 } },
      { kind: "name", written: "Friday", found: false },
    ]);
  });

  it("reports a mention said twice once", () => {
    const lines = compareWithSources([mention("name", "Monday"), mention("name", "Monday")], index);
    expect(lines.length).toBe(1);
  });

  it("puts quotes first, then names, then claims", () => {
    const lines = compareWithSources(
      [mention("claim", "the best coffee"), mention("name", "Sam"), mention("quote", "iced coffee is back")],
      index,
    );
    expect(lines.map((line) => line.kind)).toEqual(["quote", "name", "claim"]);
  });
});
