import { describe, expect, it } from "vitest";
import { readyToDraft } from "./ready-to-draft.ts";
import type { Words } from "./types.ts";

const POST: Words = {
  kind: "post",
  state: "draft",
  channel: "website",
  from: "notes.txt",
  title: "Iced coffee is back",
  tags: [],
  paragraphs: ["Iced coffee is back from Monday."],
};

describe("readyToDraft", () => {
  it("lets a draft or approved post go", () => {
    expect(readyToDraft(POST)).toEqual([]);
    expect(readyToDraft({ ...POST, state: "approved" })).toEqual([]);
  });

  it("keeps back an idea, a published piece and anything that is not a post", () => {
    expect(readyToDraft({ ...POST, state: "idea" }).length).toBe(1);
    expect(readyToDraft({ ...POST, state: "published" }).length).toBe(1);
    expect(readyToDraft({ ...POST, kind: "email" }).length).toBe(1);
  });

  it("keeps back an empty body and an excerpt longer than Ghost takes", () => {
    expect(readyToDraft({ ...POST, paragraphs: [] })).toEqual(["the body is empty"]);
    expect(readyToDraft({ ...POST, excerpt: "x".repeat(301) }).length).toBe(1);
  });
});
