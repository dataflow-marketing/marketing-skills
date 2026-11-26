import { describe, expect, it } from "vitest";
import { addUp } from "./add-up.ts";

// Monday 23 Nov 2026 00:00 in Melbourne to Thursday 27 Nov 09:15
const WEEK = { from: "2026-11-22T13:00:00.000Z", to: "2026-11-26T22:15:00.000Z" };

describe("addUp", () => {
  it("counts members who joined in the week, leaving out the person's own addresses", () => {
    const members = [
      { email: "a@example.test", createdAt: "2026-11-22T13:30:00.000Z" },
      { email: "owner@coffee-shop.example", createdAt: "2026-11-24T01:00:00.000Z" },
      { email: "b@example.test", createdAt: "2026-11-22T12:59:00.000Z" },
      { email: "c@example.test", createdAt: "2026-11-26T22:15:00.000Z" },
    ];
    expect(addUp(members, [], WEEK, ["owner@coffee-shop.example"])["new members"]).toBe(1);
  });

  it("adds up the emails sent in the week, by when they were sent", () => {
    const emails = [
      { sentAt: "2026-11-24T20:00:00.000Z", sent: 100, opens: 40, clicks: 5 },
      { sentAt: "2026-11-25T20:00:00.000Z", sent: 50, opens: 30, clicks: 2 },
      { sentAt: "2026-11-20T20:00:00.000Z", sent: 999, opens: 999, clicks: 999 },
    ];
    expect(addUp([], emails, WEEK, [])).toEqual({ "new members": 0, emails: 2, "emails sent": 150, "email opens": 70, "email clicks": 7 });
  });
});
