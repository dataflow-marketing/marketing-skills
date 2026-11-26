import { describe, expect, it } from "vitest";
import { readGraph } from "./read-graph.ts";

function numbered(text: string) {
  return text.split("\n").map((line, index) => ({ line: index + 1, text: line }));
}

describe("readGraph", () => {
  const { graph, unread } = readGraph(
    numbered(
      [
        "fact visits: cloudflare coffee-shop.example visits",
        "fact stamp cards started: paste",
        "group Regulars: tag regulars",
        "new post [Regulars] -> visits: ? (unknown)",
        "when afternoon cups under half full -> quiet afternoon offer",
        "this line means nothing",
      ].join("\n"),
    ),
  );

  it("reads facts, reading paste as told", () => {
    expect(graph.facts.map((fact) => [fact.fact, fact.source])).toEqual([
      ["visits", "cloudflare coffee-shop.example visits"],
      ["stamp cards started", "told"],
    ]);
  });

  it("reads groups, links for a group and when lines, each with its line", () => {
    expect(graph.groups[0].name).toBe("Regulars");
    expect(graph.links[0].from).toEqual([{ name: "new post", group: "Regulars" }]);
    expect(graph.links[0].to).toBe("visits");
    expect(graph.links[0].line).toBe(4);
    expect(graph.whens[0]).toEqual({ when: "afternoon cups under half full", event: "quiet afternoon offer", line: 5 });
  });

  it("gives back a line it cannot read", () => {
    expect(unread).toEqual([{ line: 6, text: "this line means nothing" }]);
  });
});
