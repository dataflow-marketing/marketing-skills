import { describe, expect, it } from "vitest";
import { readThing } from "./read-thing.ts";

describe("readThing", () => {
  it("reads an offer with its kind, words, page and the day it ends", () => {
    expect(readThing('offer Christmas cakes (sale): "Orders close on 15 December" [/news/christmas-cake-orders-open/] until 2026-12-15', "inferred", 9)).toEqual({
      word: "offer",
      name: "Christmas cakes",
      kind: "sale",
      words: '"Orders close on 15 December"',
      page: "/news/christmas-cake-orders-open/",
      until: "2026-12-15",
      source: "inferred",
      line: 9,
    });
  });

  it("reads a claim and whether the site proves it", () => {
    expect(readThing('claim "Award-winning": no proof on the site [/]', "inferred", 3)).toEqual({ word: "claim", name: "Award-winning", proved: false, page: "/", source: "inferred", line: 3 });
  });

  it("reads the other words", () => {
    expect(readThing('answers "Can I bring my dog?" [/questions/]', "observed", 1)?.name).toBe("Can I bring my dog?");
    expect(readThing("site http://localhost:4102 (sitemap)", "stated", 2)).toEqual({ word: "site", name: "http://localhost:4102", kind: "sitemap", source: "stated", line: 2 });
    expect(readThing("own", "stated", 3)?.word).toBe("own");
    expect(readThing("business coffee-shop: a takeaway coffee shop", "stated", 4)?.words).toBe("a takeaway coffee shop");
    expect(readThing("opens every day: 7.30 to 3.00 [/contact/]", "observed", 5)?.words).toBe("7.30 to 3.00");
  });

  it("reads hours with no days named", () => {
    expect(readThing('opens: "Open from seven, closed by three" [/about/]', "observed", 6)).toMatchObject({ word: "opens", name: "", page: "/about/" });
  });

  it("reads nothing it does not know", () => {
    expect(readThing("limit seats: 24", "stated", 1)).toBeUndefined();
  });
});
