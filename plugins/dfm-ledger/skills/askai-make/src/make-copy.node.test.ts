// The test for make-copy.ts on the coffee shop: the copy it makes is examples/coffee-shop/ask-ai-copy.txt, word for
// word. A .node.test.ts: it reads the examples.

import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { makeCopy } from "./make-copy.ts";

const EXAMPLES = new URL("../../../../../examples/coffee-shop/", import.meta.url);

describe("makeCopy on the coffee shop", () => {
  it("makes the example copy word for word", async () => {
    const copy = makeCopy({
      who: "the coffee shop",
      sendTo: "hello@coffee-shop.example",
      ledgerText: await readFile(new URL("ledger.txt", EXAMPLES), "utf8"),
      profileText: await readFile(new URL("profile.txt", EXAMPLES), "utf8"),
      today: "2026-12-02",
    });
    expect(copy).toBe(await readFile(new URL("ask-ai-copy.txt", EXAMPLES), "utf8"));
  });

  it("leaves the website out when there is no profile", () => {
    const copy = makeCopy({ who: "Sam", sendTo: "sam@example.test", ledgerText: "spec 1\n=== done ===\nstarted 2026-11-16\n", today: "2026-11-18" });
    expect(copy).not.toContain("=== their website ===");
    expect(copy).toContain("This is the marketing plan of Sam");
  });

  it("uses a template of the person's own in place of the default, with its blanks filled", () => {
    const copy = makeCopy({
      instructions: "Help {who} plan next week. Send the result to {send to}.",
      who: "Sam",
      sendTo: "sam@example.test",
      ledgerText: "spec 1\n=== done ===\nstarted 2026-11-16\n",
      today: "2026-11-18",
    });
    expect(copy.startsWith("=== read this first ===\nHelp Sam plan next week. Send the result to sam@example.test.\n\n=== their plan ===\n")).toBe(true);
  });
});
