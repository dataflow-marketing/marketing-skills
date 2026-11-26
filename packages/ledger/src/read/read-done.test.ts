import { describe, expect, it } from "vitest";
import { readDone } from "./read-done.ts";

function numbered(text: string) {
  return text.split("\n").map((line, index) => ({ line: index + 1, text: line }));
}

describe("readDone", () => {
  const { done, unread } = readDone(
    numbered(
      [
        "started 2026-11-16",
        "2026-11-16 open the cafe: done at 2026-11-17T09:00 Australia/Melbourne",
        "2026-11-16 fact count visits: 1,240",
        "2026-11-23 fact total loyalty list: 312",
        "2026-11-16 counted to 2026-11-18",
        '2026-11-16 said on Instagram on 2026-11-17: "Iced coffee is back" https://coffee-shop.example/iced-coffee/ [everyone] summary: "From Monday."',
        "a line of notes",
      ].join("\n"),
    ),
  );

  it("reads the start, a tick and when it was ticked", () => {
    expect(done.started).toBe("2026-11-16");
    expect(done.weeks["2026-11-16"].answers["open the cafe"]).toBe("done");
    expect(done.weeks["2026-11-16"].when?.["open the cafe"]).toBe("2026-11-17T09:00 Australia/Melbourne");
  });

  it("reads counts with their thousands and totals on their day", () => {
    expect(done.weeks["2026-11-16"].counts?.visits).toBe(1240);
    expect(done.facts.map((fact) => [fact.kind, fact.fact, fact.n])).toEqual([
      ["count", "visits", 1240],
      ["total", "loyalty list", 312],
    ]);
    expect(done.weeks["2026-11-16"].countedTo).toBe("2026-11-18");
  });

  it("reads a said line", () => {
    expect(done.weeks["2026-11-16"].said?.[0].title).toBe("Iced coffee is back");
  });

  it("keeps any other line as written and gives it back as unread", () => {
    expect(done.others).toEqual(["a line of notes"]);
    expect(unread).toEqual([{ line: 7, text: "a line of notes" }]);
  });

  it("reads a said line with a topic; leaves the topic unknown when there is none", () => {
    const { done: withTopic } = readDone(
      numbered('2026-11-30 said on Instagram on 2026-12-01: "Iced coffee is back" https://coffee-shop.example/iced-coffee/ [Regulars] topic: summer menu summary: "From Monday."'),
    );
    const said = withTopic.weeks["2026-11-30"].said?.[0];
    expect(said?.topic).toBe("summer menu");
    expect(said?.for).toEqual(["Regulars"]);
    expect(done.weeks["2026-11-16"].said?.[0].topic).toBeUndefined();
  });
});
