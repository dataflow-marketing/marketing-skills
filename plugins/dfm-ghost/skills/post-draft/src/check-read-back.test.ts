import { describe, expect, it } from "vitest";
import { checkReadBack } from "./check-read-back.ts";
import { draftRequest } from "./draft-request.ts";
import { readPost } from "./read-post.ts";
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

describe("readPost and checkReadBack", () => {
  it("pass a draft with the title and slug sent", async () => {
    const ghost = fakeGhost();
    await sendDraft(request(), TOKEN, ghost.fetch);
    const read = await readPost(COFFEE_SHOP_ADDRESS, "post1", TOKEN, ghost.fetch);

    expect(read.ok).toBe(true);
    const check = checkReadBack(read.ok ? read.post : ({} as never), { title: "Iced coffee is back", slug: "iced-coffee" });
    expect(check).toEqual({ isDraft: true, problems: [] });
  });

  it("fail when Ghost says the post is published", async () => {
    const ghost = fakeGhost("published");
    await sendDraft(request(), TOKEN, ghost.fetch);
    const read = await readPost(COFFEE_SHOP_ADDRESS, "post1", TOKEN, ghost.fetch);

    const check = checkReadBack(read.ok ? read.post : ({} as never), { title: "Iced coffee is back" });
    expect(check.isDraft).toBe(false);
    expect(check.problems[0]).toContain("FAILED: Ghost says the post is published, not a draft.");
  });

  it("find a title or slug that is not what was sent", () => {
    const post = { id: "post1", status: "draft", title: "Iced coffee", slug: "iced-coffee-2" };
    const check = checkReadBack(post, { title: "Iced coffee is back", slug: "iced-coffee" });
    expect(check.isDraft).toBe(true);
    expect(check.problems.length).toBe(2);
  });

  it("say a post that is not there", async () => {
    const read = await readPost(COFFEE_SHOP_ADDRESS, "post9", TOKEN, fakeGhost().fetch);
    expect(read).toEqual({ ok: false, problem: "Ghost answered 404: Post not found." });
  });
});
