import { describe, expect, it } from "vitest";
import { factsToRead } from "./facts-to-read.ts";

describe("factsToRead", () => {
  it("reads every fact whose source is a Ghost measure it knows and leaves the rest", () => {
    const facts = [
      { fact: "new subscribers", source: "ghost coffee-shop new members" },
      { fact: "opens", source: "ghost coffee-shop email opens (observed)" },
      { fact: "sent", source: "ghost coffee-shop emails sent" },
      { fact: "site visits", source: "cloudflare coffee-shop.example visits" },
      { fact: "cups served", source: "told" },
    ];
    expect(factsToRead(facts)).toEqual({
      facts: [
        { fact: "new subscribers", site: "coffee-shop", measure: "new members" },
        { fact: "opens", site: "coffee-shop", measure: "email opens" },
        { fact: "sent", site: "coffee-shop", measure: "emails sent" },
      ],
      notRead: [],
    });
  });

  it("names a Ghost measure it does not read, for the person to tell", () => {
    const result = factsToRead([{ fact: "nudge opens", source: "ghost coffee-shop nudge opens" }]);
    expect(result).toEqual({ facts: [], notRead: ["nudge opens"] });
  });
});
