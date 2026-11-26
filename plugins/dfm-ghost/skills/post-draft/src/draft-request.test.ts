import { describe, expect, it } from "vitest";
import { postsUrl } from "./admin-api.ts";
import { draftRequest, expectedPost } from "./draft-request.ts";
import { namesAStatus } from "./names-a-status.ts";
import { readWords } from "./read-words.ts";
import type { Words } from "./types.ts";
import { COFFEE_SHOP_ADDRESS, COFFEE_SHOP_SITE, ICED_COFFEE_WORDS } from "../../../fixtures/coffee-shop.ts";

function icedCoffee(): Words {
  const read = readWords(ICED_COFFEE_WORDS);
  if (!read.ok) {
    throw new Error(read.problems.join("\n"));
  }
  return read.words;
}

describe("draftRequest", () => {
  const request = draftRequest(icedCoffee(), COFFEE_SHOP_SITE);

  it("creates a post from the words file", () => {
    expect(request.method).toBe("POST");
    expect(request.url).toBe(postsUrl(COFFEE_SHOP_ADDRESS));
    expect(JSON.parse(request.body)).toEqual({
      posts: [
        {
          title: "Iced coffee is back",
          html: "<p>The first hot morning always brings the same question at the counter.</p>\n<p>Iced coffee is back from Monday.</p>",
          custom_excerpt: "From Monday, with cake from the bakery next door.",
          tags: [{ name: "menu" }, { name: "summer" }],
          slug: "iced-coffee",
        },
      ],
    });
  });

  it("never names a status, even for approved words", () => {
    const approved = draftRequest({ ...icedCoffee(), state: "approved" }, COFFEE_SHOP_SITE);
    expect(namesAStatus(request.body)).toBe(false);
    expect(namesAStatus(approved.body)).toBe(false);
    expect(request.body).not.toContain("status");
  });

  it("expects the title and the slug from the link", () => {
    expect(expectedPost(icedCoffee(), COFFEE_SHOP_SITE)).toEqual({ title: "Iced coffee is back", slug: "iced-coffee" });
  });
});
