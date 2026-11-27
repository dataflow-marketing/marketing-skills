import { describe, expect, it } from "vitest";
import { splitSource } from "./source-word.ts";

describe("splitSource", () => {
  it("takes the source word off the end", () => {
    expect(splitSource('offer stamp card: "the tenth coffee is on us" [/] (observed)')).toEqual({ text: 'offer stamp card: "the tenth coffee is on us" [/]', source: "observed", written: true });
  });

  it("reads a line with no source word as stated", () => {
    expect(splitSource("every week new post")).toEqual({ text: "every week new post", source: "stated", written: false });
  });

  it("leaves a link's strength alone: it is not a source", () => {
    expect(splitSource("new post -> visits: ? (unknown)").written).toBe(false);
  });
});
