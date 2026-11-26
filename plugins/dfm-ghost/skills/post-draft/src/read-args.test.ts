import { describe, expect, it } from "vitest";
import { readArgs } from "./read-args.ts";

const BASE = ["--words", "drafts/iced-coffee.txt", "--site", "coffee-shop", "--settings", "settings.txt"];

describe("readArgs", () => {
  it("needs the report to preview or write", () => {
    expect(readArgs(BASE, "preview").ok).toBe(false);
    expect(readArgs([...BASE, "--report", "report.txt", "--go"], "go")).toEqual({
      ok: true,
      args: { words: "drafts/iced-coffee.txt", site: "coffee-shop", settings: "settings.txt", report: "report.txt" },
    });
  });

  it("needs the post id to read back", () => {
    expect(readArgs([...BASE, "--read-back"], "read-back").ok).toBe(false);
    expect(readArgs([...BASE, "--read-back", "--id", "post1"], "read-back").ok).toBe(true);
  });

  it("refuses what it does not understand, such as a status", () => {
    expect(readArgs([...BASE, "--report", "r.txt", "--status", "published"], "go").ok).toBe(false);
  });
});
