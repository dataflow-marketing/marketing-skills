import { describe, expect, it } from "vitest";
import { draftRequest } from "./draft-request.ts";
import { readWords } from "./read-words.ts";
import { sendDraft } from "./send-draft.ts";
import type { DraftRequest, Words } from "./types.ts";
import { COFFEE_SHOP_ADDRESS, COFFEE_SHOP_SITE, ICED_COFFEE_WORDS } from "../../../fixtures/coffee-shop.ts";
import { fakeGhost } from "../../../fixtures/fake-ghost.ts";

const TOKEN = "made.up.token";

function icedCoffee(): Words {
  const read = readWords(ICED_COFFEE_WORDS);
  if (!read.ok) {
    throw new Error(read.problems.join("\n"));
  }
  return read.words;
}

function request(): DraftRequest {
  return draftRequest(icedCoffee(), COFFEE_SHOP_SITE);
}

describe("sendDraft", () => {
  it("creates a draft, sending the body exactly as previewed", async () => {
    const ghost = fakeGhost();
    const created = await sendDraft(request(), TOKEN, ghost.fetch);

    expect(created).toEqual({ ok: true, post: { id: "post1", status: "draft", title: "Iced coffee is back", slug: "iced-coffee" } });
    expect(ghost.requests.length).toBe(1);
    expect(ghost.requests[0].body).toBe(request().body);
    expect(ghost.requests[0].headers.Authorization).toBe(`Ghost ${TOKEN}`);
    expect(ghost.requests[0].body).not.toContain("status");
  });

  it("refuses a body that names a status and sends nothing", async () => {
    const ghost = fakeGhost();
    const withStatus = { ...request(), body: JSON.stringify({ posts: [{ title: "Iced coffee is back", status: "published" }] }) };
    const created = await sendDraft(withStatus, TOKEN, ghost.fetch);

    expect(created.ok).toBe(false);
    expect(ghost.requests.length).toBe(0);
  });

  it("gives Ghost's own message when Ghost says no", async () => {
    const ghost = fakeGhost();
    const created = await sendDraft({ ...request(), url: `${COFFEE_SHOP_ADDRESS}/ghost/api/admin/posts/missing/` }, "", ghost.fetch);
    expect(created).toEqual({ ok: false, problem: "Ghost answered 401: Authorization failed" });
  });

  it("says Ghost could not be reached, without the token", async () => {
    const ghost = fakeGhost();
    const created = await sendDraft({ ...request(), url: "https://elsewhere.example/" }, TOKEN, ghost.fetch);
    expect(created.ok).toBe(false);
    expect(JSON.stringify(created)).not.toContain(TOKEN);
  });
});
