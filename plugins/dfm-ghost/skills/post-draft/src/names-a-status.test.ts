import { describe, expect, it } from "vitest";
import { namesAStatus } from "./names-a-status.ts";

describe("namesAStatus", () => {
  it("catches a status on any post and a body it cannot read", () => {
    expect(namesAStatus(JSON.stringify({ posts: [{ title: "a", status: "published" }] }))).toBe(true);
    expect(namesAStatus(JSON.stringify({ posts: [{ title: "a" }, { title: "b", status: "draft" }] }))).toBe(true);
    expect(namesAStatus("not json")).toBe(true);
    expect(namesAStatus(JSON.stringify({ post: {} }))).toBe(true);
  });
});
