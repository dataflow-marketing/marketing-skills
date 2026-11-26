import { describe, expect, it } from "vitest";
import { fetchText } from "./fetch-text.ts";

describe("fetchText", () => {
  it("gives back the text of an address", async () => {
    const send = async () => new Response("hello", { status: 200 });
    expect(await fetchText("https://coffee-shop.example/", send)).toEqual({ ok: true, text: "hello" });
  });

  it("names the status when the address is not there", async () => {
    const send = async () => new Response("not found", { status: 404 });
    expect(await fetchText("https://coffee-shop.example/llms-full.txt", send)).toEqual({
      ok: false,
      status: 404,
      problem: "https://coffee-shop.example/llms-full.txt answered 404",
    });
  });

  it("says when the site cannot be reached", async () => {
    const send = async () => {
      throw new Error("offline");
    };
    expect((await fetchText("https://coffee-shop.example/", send)).ok).toBe(false);
  });
});
