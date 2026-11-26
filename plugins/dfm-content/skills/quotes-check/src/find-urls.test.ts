import { describe, expect, it } from "vitest";
import { findUrls } from "./find-urls.ts";

describe("findUrls", () => {
  it("finds a web address", () => {
    expect(findUrls("See https://coffee-shop.example/menu/ now")).toEqual([{ start: 4, end: 37 }]);
  });
});
