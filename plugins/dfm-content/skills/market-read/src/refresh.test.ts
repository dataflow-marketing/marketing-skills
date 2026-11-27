import { describe, expect, it } from "vitest";
import { addRead } from "./add-read.ts";
import { newLedger } from "./new-ledger.ts";
import { refresh } from "./refresh.ts";

const post = (day: string, title: string) => ({ day, title, url: `http://localhost:4102/news/${day}/`, text: `${title}\nWords for ${title}.\n` });

describe("a read, then the ticks and the summary", () => {
  it("writes each post once, ticks its steps and sums it up", () => {
    const first = addRead(newLedger("the-long-table", "http://localhost:4102", false), {
      day: "2026-11-27",
      counts: { pages: 6, posts: 2 },
      posts: [post("2026-11-16", "This week's special: shakshuka"), post("2026-11-23", "This week's special: corn fritters")],
    });
    expect(first.newPosts).toBe(2);

    const planned = first.text.replace("=== plan ===\n", "=== plan ===\nevery week this week's special from 2026-11-16\n");
    const second = addRead(planned, {
      day: "2026-12-09",
      counts: { pages: 6, posts: 3 },
      posts: [post("2026-11-23", "This week's special: corn fritters"), post("2026-11-30", "Trivia night")],
    });
    expect(second.newPosts).toBe(1);

    const text = refresh(second.text);
    expect(text).toContain("2026-11-23 read on 2026-11-27\n2026-11-23 fact total pages: 6\n2026-11-23 fact total posts: 2\n");
    expect(text).toContain("2026-11-16 this week's special: done");
    expect(text).not.toContain("2026-11-30 this week's special: done");
    expect(text).toContain("every week this week's special: done 2 of 3 weeks, not in the week of 2026-11-30, unknown (calculated)");
    expect(text).toContain("as at 2026-12-07, read 2 times from 2026-11-23 (calculated)");
    expect(refresh(text)).toBe(text);
  });
});
