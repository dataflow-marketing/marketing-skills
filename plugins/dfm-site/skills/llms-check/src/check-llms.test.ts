import { describe, expect, it } from "vitest";
import { checkLlms } from "./check-llms.ts";
import { describeCheck } from "./describe.ts";

const answer = (pages: Record<string, { status: number; text: string }>) => async (url: string) => {
  const page = pages[url] ?? { status: 404, text: "not found" };
  return new Response(page.text, { status: page.status });
};

describe("checkLlms", () => {
  it("reads what an llms.txt and an llms-full.txt hold", async () => {
    const send = answer({
      "https://coffee-shop.example/llms.txt": { status: 200, text: "# The coffee shop\n> Good coffee on your way to work.\n## Pages\n- [About us](https://coffee-shop.example/about/)\n## Posts\n- [Iced coffee is back](https://coffee-shop.example/iced-coffee/)\n" },
      "https://coffee-shop.example/llms-full.txt": { status: 200, text: "# The coffee shop\n## Pages\n### About us\nURL: x\nWords.\n## Posts\n### Iced coffee is back\nURL: y\nMore words.\n" },
    });
    const check = await checkLlms("https://coffee-shop.example", send);
    expect(describeCheck(check)).toBe(
      [
        "llms-check: https://coffee-shop.example",
        "/llms.txt: on, 18 words, 2 links",
        "  title: The coffee shop",
        "  summary: Good coffee on your way to work.",
        "  sections: Pages, Posts",
        "/llms-full.txt: on, 2 pages and posts, 18 words",
      ].join("\n"),
    );
  });

  it("says when a file is not there; when a web page answers every address", async () => {
    const send = answer({ "https://coffee-shop.example/llms.txt": { status: 200, text: "<!doctype html><html>Not found</html>" } });
    const check = await checkLlms("https://coffee-shop.example", send);
    expect(check.llmsTxt).toEqual({ on: false, problem: "https://coffee-shop.example/llms.txt is a web page, not the file" });
    expect(check.llmsFull).toEqual({ on: false, problem: "https://coffee-shop.example/llms-full.txt answered 404" });
  });
});
