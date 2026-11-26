import { afterEach, describe, expect, it, vi } from "vitest";
import { askCloudflare, CLOUDFLARE_GRAPHQL } from "./ask-cloudflare.ts";

const ASKED = { account: "abc", token: "secret-token", host: "coffee-shop.example", from: "2026-11-22T13:00:00.000Z", to: "2026-11-26T22:15:00.000Z" };

afterEach(() => {
  vi.unstubAllGlobals();
});

function answerWith(status: number, body: unknown) {
  const fetchMock = vi.fn(async () => new Response(JSON.stringify(body), { status }));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("askCloudflare", () => {
  it("asks for the host with and without www in the range then reads the rows", async () => {
    const fetchMock = answerWith(200, {
      data: { viewer: { accounts: [{ rumPageloadEventsAdaptiveGroups: [{ count: 16, sum: { visits: 16 }, avg: { sampleInterval: 1 }, dimensions: { refererHost: "" } }] }] } },
    });
    expect(await askCloudflare(ASKED)).toEqual({ ok: true, rows: [{ views: 16, visits: 16, refererHost: "", sampleInterval: 1 }] });

    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe(CLOUDFLARE_GRAPHQL);
    expect(init.headers).toEqual({ Authorization: "Bearer secret-token", "Content-Type": "application/json" });
    const sent = JSON.parse(String(init.body));
    expect(sent.variables).toEqual({ account: "abc", from: ASKED.from, to: ASKED.to, hosts: ["coffee-shop.example", "www.coffee-shop.example"] });
    expect(sent.query).toContain('requestPath_notlike: "/ghost/%"');
    expect(sent.query).toContain('requestPath_notlike: "/p/%"');
  });

  it("gives Cloudflare's words when it refuses, never the token", async () => {
    answerWith(200, { errors: [{ message: "not authorized for that account" }] });
    const result = await askCloudflare(ASKED);
    expect(result).toEqual({ ok: false, problem: "Cloudflare said 200: not authorized for that account" });
    expect(JSON.stringify(result)).not.toContain("secret-token");
  });

  it("says to check the account when none comes back", async () => {
    answerWith(200, { data: { viewer: { accounts: [] } } });
    const result = await askCloudflare(ASKED);
    expect(result.ok).toBe(false);
  });
});
