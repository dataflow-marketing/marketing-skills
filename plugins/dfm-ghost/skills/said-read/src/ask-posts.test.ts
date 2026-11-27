import { afterEach, describe, expect, it, vi } from "vitest";
import { askPosts } from "./ask-posts.ts";

const ASKED = { address: "https://coffee-shop.example", token: "secret-token", from: "2026-11-22T13:00:00.000Z", to: "2026-11-29T13:00:00.000Z" };

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("askPosts", () => {
  it("asks for the posts from 90 days before the week with their email, tags and words", async () => {
    const fetchMock = vi.fn(async (_url: string, _init?: RequestInit) => Response.json({ posts: [{ title: "Hi", url: "u", status: "published" }] }));
    vi.stubGlobal("fetch", fetchMock);
    expect(await askPosts(ASKED)).toEqual({ ok: true, posts: [{ title: "Hi", url: "u", status: "published" }] });
    const url = decodeURIComponent(String(fetchMock.mock.calls[0][0]));
    expect(url).toContain("published_at:>='2026-08-24'+published_at:<'2026-11-30'");
    expect(url).toContain("include=email,tags&formats=plaintext");
    expect(fetchMock.mock.calls[0][1]).toEqual({ headers: { Authorization: "Ghost secret-token", "Accept-Version": "v5.0" } });
  });

  it("says what Ghost answered when it refuses, never the token", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("{}", { status: 401 })));
    const result = await askPosts(ASKED);
    expect(result).toEqual({ ok: false, problem: "Ghost at https://coffee-shop.example said 401 to /posts/" });
    expect(JSON.stringify(result)).not.toContain("secret-token");
  });
});
