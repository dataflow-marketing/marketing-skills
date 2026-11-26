import { afterEach, describe, expect, it, vi } from "vitest";
import { askGhost } from "./ask-ghost.ts";

const ASKED = { address: "https://coffee-shop.example", token: "secret-token", from: "2026-11-22T13:00:00.000Z", to: "2026-11-26T22:15:00.000Z" };

afterEach(() => {
  vi.unstubAllGlobals();
});

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

describe("askGhost", () => {
  it("reads every page of members and the posts sent as email", async () => {
    const fetchMock = vi.fn(async (url: string, _init?: RequestInit) => {
      if (url.includes("/members/") && url.includes("page=1")) {
        return json({ members: [{ email: "A@example.test", created_at: "2026-11-23T00:00:00.000Z" }], meta: { pagination: { next: 2 } } });
      }
      if (url.includes("/members/")) {
        return json({ members: [{ email: "b@example.test", created_at: "2026-10-01T00:00:00.000Z" }], meta: { pagination: { next: null } } });
      }
      return json({
        posts: [
          { email: { email_count: 10, delivered_count: 9, opened_count: 4, created_at: "2026-11-24T00:00:00.000Z" }, count: { clicks: 1 } },
          { email: null },
        ],
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    expect(await askGhost(ASKED)).toEqual({
      ok: true,
      members: [
        { email: "a@example.test", createdAt: "2026-11-23T00:00:00.000Z" },
        { email: "b@example.test", createdAt: "2026-10-01T00:00:00.000Z" },
      ],
      emails: [{ sentAt: "2026-11-24T00:00:00.000Z", sent: 9, opens: 4, clicks: 1 }],
    });

    const postsUrl = String(fetchMock.mock.calls[2][0]);
    expect(postsUrl).toContain("include=email,count.clicks");
    expect(postsUrl).not.toContain("fields=");
    expect(decodeURIComponent(postsUrl)).toContain("published_at:>='2026-08-24'+published_at:<'2026-11-27'");
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    expect(init.headers).toEqual({ Authorization: "Ghost secret-token", "Accept-Version": "v5.0" });
  });

  it("says what Ghost answered when it refuses, never the token", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => json({}, 401)));
    const result = await askGhost(ASKED);
    expect(result).toEqual({ ok: false, problem: "Ghost at https://coffee-shop.example said 401 to /members/" });
    expect(JSON.stringify(result)).not.toContain("secret-token");
  });
});
