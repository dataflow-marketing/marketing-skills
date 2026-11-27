import { describe, expect, it } from "vitest";
import { dayIn, saidLines } from "./said-lines.ts";
import type { Post } from "./said-lines.ts";

const TZ = "Australia/Melbourne";
// the week of Monday 16 Nov 2026 in Melbourne, as moments in UTC
const WEEK = { week: "2026-11-16", from: "2026-11-15T13:00:00.000Z", to: "2026-11-22T13:00:00.000Z" };
const REGULARS = { name: "Regulars", tag: "regulars" };
const STUDENTS = { name: "Students", tag: "students" };

function post(extra: Partial<Post>): Post {
  return { title: "A made up post", url: "https://coffee-shop.example/a-post/", status: "draft", plaintext: "One. Two.", ...extra };
}

describe("dayIn", () => {
  it("gives the day in the time zone: late Sunday UTC is Monday in Melbourne in summer", () => {
    expect(dayIn("2026-11-22T13:00:00.000Z", TZ)).toBe("2026-11-23");
    expect(dayIn("2026-11-22T12:59:00.000Z", TZ)).toBe("2026-11-22");
  });
});

describe("saidLines", () => {
  it("writes a post emailed and published in the week as said by email and on the website", () => {
    const p = post({ status: "published", published_at: "2026-11-17T22:00:00.000Z", email: { email_count: 40, created_at: "2026-11-17T22:05:00.000Z" }, custom_excerpt: "Short." });
    expect(saidLines([p], [], WEEK, TZ)).toEqual([
      '2026-11-16 said by email and on the website on 2026-11-18: "A made up post" https://coffee-shop.example/a-post/ [everyone] summary: "Short."',
    ]);
  });

  it("writes an email only as said by email, on the day it was sent, even from a post dated weeks before", () => {
    const p = post({ status: "published", published_at: "2026-10-01T01:00:00.000Z", email: { email_count: 40, created_at: "2026-11-20T01:00:00.000Z" } });
    expect(saidLines([p], [], WEEK, TZ)[0]).toContain("said by email on 2026-11-20:");
  });

  it("writes a post published with no email (or an email sent to no one) as said on the website", () => {
    const p = post({ status: "published", published_at: "2026-11-20T01:00:00.000Z", email: { email_count: 0, created_at: "2026-11-20T01:00:00.000Z" } });
    expect(saidLines([p], [], WEEK, TZ)[0]).toContain("said on the website on 2026-11-20:");
  });

  it("never writes a draft or a scheduled post", () => {
    const draft = post({ status: "draft", published_at: "2026-11-20T01:00:00.000Z" });
    const scheduled = post({ status: "scheduled", published_at: "2026-11-21T01:00:00.000Z" });
    expect(saidLines([draft, scheduled], [], WEEK, TZ)).toEqual([]);
  });

  it("keeps to the week in the time zone: Sunday evening UTC before it counts, the Sunday after does not", () => {
    const before = post({ status: "published", published_at: "2026-11-15T14:00:00.000Z" });
    const after = post({ status: "published", published_at: "2026-11-22T14:00:00.000Z" });
    expect(saidLines([before, after], [], WEEK, TZ)).toHaveLength(1);
    expect(saidLines([before], [], WEEK, TZ)[0]).toContain("on 2026-11-16:");
  });

  it("names each group whose tag the post carries, in the ledger's order; otherwise everyone", () => {
    const tagged = post({ status: "published", published_at: "2026-11-20T01:00:00.000Z", tags: [{ slug: "students" }, { slug: "regulars" }] });
    const other = post({ status: "published", published_at: "2026-11-20T01:00:00.000Z", tags: [{ slug: "news" }] });
    expect(saidLines([tagged], [REGULARS, STUDENTS], WEEK, TZ)[0]).toContain("[Regulars, Students]");
    expect(saidLines([other], [REGULARS], WEEK, TZ)[0]).toContain("[everyone]");
  });
});
