import { describe, expect, it } from "vitest";
import { readArgs } from "./read-args.ts";

describe("readArgs", () => {
  it("reads the text and one or more sources", () => {
    const asked = readArgs(["--text", "draft.txt", "--against", "site.txt", "--against", "counts.txt", "--json"]);
    expect(asked).toEqual({ ok: true, files: { text: "draft.txt", against: ["site.txt", "counts.txt"] } });
  });

  it("refuses when the source is missing", () => {
    expect(readArgs(["--text", "draft.txt"]).ok).toBe(false);
  });

  it("refuses what it does not understand", () => {
    expect(readArgs(["draft.txt"]).ok).toBe(false);
  });
});
