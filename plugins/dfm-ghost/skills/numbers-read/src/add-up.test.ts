import { describe, expect, it } from "vitest";
import { addUp, emailsFor } from "./add-up.ts";

// Monday 23 Nov 2026 00:00 in Melbourne to Thursday 27 Nov 09:15
const WEEK = { from: "2026-11-22T13:00:00.000Z", to: "2026-11-26T22:15:00.000Z" };

describe("addUp", () => {
  it("counts members who joined in the week, leaving out the person's own addresses", () => {
    const members = [
      { email: "a@example.test", createdAt: "2026-11-22T13:30:00.000Z", paidStarts: [] },
      { email: "owner@coffee-shop.example", createdAt: "2026-11-24T01:00:00.000Z", paidStarts: [] },
      { email: "b@example.test", createdAt: "2026-11-22T12:59:00.000Z", paidStarts: [] },
      { email: "c@example.test", createdAt: "2026-11-26T22:15:00.000Z", paidStarts: [] },
    ];
    expect(addUp(members, [], WEEK, ["owner@coffee-shop.example"])["new members"]).toBe(1);
  });

  it("adds up the emails sent in the week, by when they were sent", () => {
    const emails = [
      { sentAt: "2026-11-24T20:00:00.000Z", sent: 100, opens: 40, clicks: 5, tags: [] },
      { sentAt: "2026-11-25T20:00:00.000Z", sent: 50, opens: 30, clicks: 2, tags: [] },
      { sentAt: "2026-11-20T20:00:00.000Z", sent: 999, opens: 999, clicks: 999, tags: [] },
    ];
    expect(addUp([], emails, WEEK, [])).toEqual({ "new members": 0, "paid plans": 0, emails: 2, "emails sent": 150, "email opens": 70, "email clicks": 7 });
  });

  it("counts the paid plans that started in the week", () => {
    const members = [
      { email: "a@example.test", createdAt: "2026-10-01T00:00:00.000Z", paidStarts: ["2026-11-24T01:00:00.000Z"] },
      { email: "b@example.test", createdAt: "2026-10-01T00:00:00.000Z", paidStarts: ["2026-10-02T01:00:00.000Z"] },
    ];
    expect(addUp(members, [], WEEK, [])["paid plans"]).toBe(1);
  });
});

describe("emailsFor", () => {
  it("keeps the emails whose post carries the tag", () => {
    const emails = [
      { sentAt: "2026-11-24T20:00:00.000Z", sent: 10, opens: 4, clicks: 1, tags: ["parents"] },
      { sentAt: "2026-11-24T20:00:00.000Z", sent: 20, opens: 8, clicks: 2, tags: ["teachers"] },
    ];
    expect(emailsFor("parents", emails)).toEqual([emails[0]]);
  });
});
