import { describe, expect, it } from "vitest";
import { addUp } from "./add-up.ts";

const HOST = "coffee-shop.example";

describe("addUp", () => {
  it("adds visits and views and counts views from another site as outside", () => {
    const rows = [
      { views: 10, visits: 6, refererHost: "", sampleInterval: 1 },
      { views: 4, visits: 0, refererHost: "www.coffee-shop.example", sampleInterval: 1 },
      { views: 3, visits: 3, refererHost: "www.google.com", sampleInterval: 1 },
    ];
    expect(addUp(HOST, rows)).toEqual({ visits: 9, views: 17, outside: 3, estimated: false });
  });

  it("marks the numbers as estimates when Cloudflare sampled a row", () => {
    const rows = [{ views: 20, visits: 10, refererHost: "", sampleInterval: 10 }];
    expect(addUp(HOST, rows).estimated).toBe(true);
  });

  it("gives zeros for a week with no rows", () => {
    expect(addUp(HOST, [])).toEqual({ visits: 0, views: 0, outside: 0, estimated: false });
  });
});
