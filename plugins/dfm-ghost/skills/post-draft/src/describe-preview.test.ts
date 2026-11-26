import { describe, expect, it } from "vitest";
import { describePreview } from "./describe-preview.ts";
import { draftRequest } from "./draft-request.ts";
import { readWords } from "./read-words.ts";
import type { Words } from "./types.ts";
import { COFFEE_SHOP_ADMIN_KEY, COFFEE_SHOP_SITE, ICED_COFFEE_WORDS } from "../../../fixtures/coffee-shop.ts";

function icedCoffee(): Words {
  const read = readWords(ICED_COFFEE_WORDS);
  if (!read.ok) {
    throw new Error(read.problems.join("\n"));
  }
  return read.words;
}

describe("describePreview", () => {
  const preview = describePreview(draftRequest(icedCoffee(), COFFEE_SHOP_SITE), COFFEE_SHOP_SITE);

  it("shows the body byte for byte and says nothing was sent", () => {
    expect(preview.text).toContain("preview: nothing sent");
    expect(preview.text).toContain(draftRequest(icedCoffee(), COFFEE_SHOP_SITE).body);
    expect(preview.text).toContain("status: not sent");
  });

  it("names the key's variable, never the key", () => {
    expect(preview.text).toContain("COFFEE_SHOP_GHOST_ADMIN_KEY");
    expect(preview.text).not.toContain(COFFEE_SHOP_ADMIN_KEY);
    expect(JSON.stringify(preview.data)).not.toContain(COFFEE_SHOP_ADMIN_KEY);
  });
});
