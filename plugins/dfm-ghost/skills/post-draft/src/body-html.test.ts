import { describe, expect, it } from "vitest";
import { bodyHtml } from "./body-html.ts";

describe("bodyHtml", () => {
  it("makes one paragraph a block and escapes the words", () => {
    expect(bodyHtml(["Tea & cake", "One <b>\nTwo"])).toBe("<p>Tea &amp; cake</p>\n<p>One &lt;b&gt;<br>Two</p>");
  });
});
