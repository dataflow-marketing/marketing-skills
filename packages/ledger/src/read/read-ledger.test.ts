import { describe, expect, it } from "vitest";
import { readLedger } from "./read-ledger.ts";

const STARTER = [
  "spec 1",
  "=== graph ===",
  "fact followers: told",
  "new post -> followers: ? (unknown)",
  "=== plan ===",
  "start 2026-11-16",
  "every week new post from 2026-11-16",
  "=== done ===",
  "started 2026-11-16",
].join("\n");

describe("readLedger", () => {
  it("reads every part of a spec 1 ledger", () => {
    const ledger = readLedger(STARTER);
    expect(ledger.spec).toBe(1);
    expect(ledger.graph?.links.length).toBe(1);
    expect(ledger.plan?.repeats.length).toBe(1);
    expect(ledger.done?.started).toBe("2026-11-16");
    expect(ledger.unreadable).toEqual([]);
  });

  it("sets aside a line with a new spec 1 word and names a line it cannot read", () => {
    const ledger = readLedger(`${STARTER.replace("=== plan ===", "limit seats: 24\nnot a graph line\n=== plan ===")}`);
    expect(ledger.notReadYet.map((line) => line.word)).toEqual(["limit"]);
    expect(ledger.unreadable.map((line) => line.text)).toEqual(["not a graph line"]);
  });

  it("reads curly quotes pasted from a chat as straight ones", () => {
    const said = `2026-11-16 said on the website on 2026-11-17: \u201CHello\u201D https://coffee-shop.example/hello/ [everyone] summary: \u201CHi.\u201D`;
    const ledger = readLedger(`${STARTER}\n${said}`);
    expect(ledger.done?.weeks["2026-11-16"].said?.[0].title).toBe("Hello");
  });

  it("reads a business from inside and outside in one ledger, nothing left over", () => {
    const text = [
      "spec 1",
      "=== graph ===",
      "business coffee-shop: a takeaway coffee shop (stated)",
      "site http://localhost:4100 (sitemap)",
      "fact posts: the site's sitemap (observed)",
      "offer stamp card (plan): the tenth coffee free (stated)",
      'offer stamp card: "the tenth coffee is on us" [/] (observed)',
      'claim "Good coffee": no proof on the site [/] (inferred)',
      "=== plan ===",
      "start 2026-11-16",
      "every week new post (stated)",
      "every week a post from 2026-11-09 (inferred)",
      "every month guest coffee from 2026-10-01 (inferred)",
      'on 2026-12-24 to 2027-01-01: "We are closed" [/news/closed/] (inferred)',
      "=== done ===",
      "2026-11-23 read on 2026-11-27",
      "2026-11-23 fact total posts: 2",
      "2026-11-23 new post: done",
      '2026-11-23 new claim "Good coffee"',
    ].join("\n");
    const ledger = readLedger(text);
    expect([ledger.unreadable, ledger.notReadYet]).toEqual([[], []]);
    expect(ledger.graph?.things?.map((thing) => `${thing.word} ${thing.name} ${thing.source}`)).toEqual([
      "business coffee-shop stated",
      "site http://localhost:4100 stated",
      "offer stamp card stated",
      "offer stamp card observed",
      "claim Good coffee inferred",
    ]);
    expect(ledger.plan?.repeats.map((repeat) => repeat.methods[0].name)).toEqual(["new post", "a post"]);
    expect(ledger.plan?.otherRepeats?.[0].name).toBe("guest coffee");
    expect(ledger.done?.weeks["2026-11-23"]).toMatchObject({ readOn: "2026-11-27", answers: { "new post": "done" }, changes: ['new claim "Good coffee"'] });
  });
});
