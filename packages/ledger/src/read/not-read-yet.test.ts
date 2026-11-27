import { describe, expect, it } from "vitest";
import { notReadYetWord } from "./not-read-yet.ts";

describe("notReadYetWord", () => {
  it("names a new spec 1 word the reader sets aside", () => {
    expect(notReadYetWord("graph", "limit seats: 24")).toBe("limit");
    expect(notReadYetWord("graph", "[Keen] not seen 6 weeks -> [Drifting]")).toBe("moving between groups");
    expect(notReadYetWord("plan", "ask stamp card at the counter: take a stamp card")).toBe("ask");
  });

  it("names nothing for a line made of words it reads", () => {
    expect(notReadYetWord("graph", "fact visits: told")).toBeUndefined();
    expect(notReadYetWord("summary", "anything at all")).toBeUndefined();
  });
});
