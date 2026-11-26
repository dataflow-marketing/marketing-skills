import { describe, expect, it } from "vitest";
import { readPost } from "./read-post.ts";

describe("readPost", () => {
  it("asks Ghost for the post by its id with the token", async () => {
    const seen: { url: string; init?: RequestInit }[] = [];
    const send = async (url: string, init?: RequestInit) => {
      seen.push({ url, init });
      const post = { id: "p1", status: "draft", title: "Iced coffee is back", slug: "iced-coffee" };
      return new Response(JSON.stringify({ posts: [post] }), { status: 200 });
    };
    const result = await readPost("https://coffee-shop.example", "p1", "made-up-token", send);
    expect(result.ok && result.post.status).toBe("draft");
    expect(seen[0].url).toContain("/ghost/api/admin/posts/p1/");
    expect(seen[0].init?.method).toBe("GET");
    expect((seen[0].init?.headers as Record<string, string>).Authorization).toBe("Ghost made-up-token");
  });

  it("says Ghost could not be reached, without the token", async () => {
    const send = async () => {
      throw new Error("offline");
    };
    const result = await readPost("https://coffee-shop.example", "p1", "made-up-token", send);
    expect(result.ok).toBe(false);
    expect(JSON.stringify(result)).not.toContain("made-up-token");
  });
});
