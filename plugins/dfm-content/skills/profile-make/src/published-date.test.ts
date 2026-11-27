import { describe, expect, it } from "vitest";
import { publishedDate } from "./published-date.ts";

describe("publishedDate", () => {
  it("reads article:published_time, either way round", () => {
    expect(publishedDate('<meta property="article:published_time" content="2026-11-23T08:00:00.000Z">')).toBe("2026-11-23");
    expect(publishedDate('<meta content="2026-11-23T08:00:00Z" property="article:published_time">')).toBe("2026-11-23");
  });

  it("falls back to the first dated time element", () => {
    expect(publishedDate('<main><time datetime="2026-11-16">16 Nov</time></main>')).toBe("2026-11-16");
  });

  it("gives nothing for a page with no published day", () => {
    expect(publishedDate("<main><h1>Menu</h1></main>")).toBeUndefined();
    expect(publishedDate("<time>16 Nov</time>")).toBeUndefined();
  });
});
