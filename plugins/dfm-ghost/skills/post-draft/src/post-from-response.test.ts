import { describe, expect, it } from "vitest";
import { postFromResponse } from "./post-from-response.ts";

function answer(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

describe("postFromResponse", () => {
  it("reads the post's id, status, title and slug", async () => {
    const post = { id: "p1", status: "draft", title: "Iced coffee is back", slug: "iced-coffee" };
    expect(await postFromResponse(answer(201, { posts: [post] }))).toEqual({ ok: true, post });
  });

  it("gives Ghost's own message when Ghost says no", async () => {
    const result = await postFromResponse(answer(422, { errors: [{ message: "Validation error" }] }));
    expect(result).toEqual({ ok: false, problem: "Ghost answered 422: Validation error" });
  });

  it("refuses an answer with no whole post", async () => {
    const result = await postFromResponse(answer(200, { posts: [{ id: "p1" }] }));
    expect(result.ok).toBe(false);
  });

  it("copes with an answer that is not JSON", async () => {
    const result = await postFromResponse(new Response("Bad gateway", { status: 502 }));
    expect(result).toEqual({ ok: false, problem: "Ghost answered 502: no message" });
  });
});
