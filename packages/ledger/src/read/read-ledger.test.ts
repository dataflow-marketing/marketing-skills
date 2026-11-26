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
    const ledger = readLedger(`${STARTER.replace("=== plan ===", "channel Instagram: our account\nnot a graph line\n=== plan ===")}`);
    expect(ledger.notReadYet.map((line) => line.word)).toEqual(["channel"]);
    expect(ledger.unreadable.map((line) => line.text)).toEqual(["not a graph line"]);
  });

  it("reads curly quotes pasted from a chat as straight ones", () => {
    const said = `2026-11-16 said on the website on 2026-11-17: \u201CHello\u201D https://coffee-shop.example/hello/ [everyone] summary: \u201CHi.\u201D`;
    const ledger = readLedger(`${STARTER}\n${said}`);
    expect(ledger.done?.weeks["2026-11-16"].said?.[0].title).toBe("Hello");
  });
});
