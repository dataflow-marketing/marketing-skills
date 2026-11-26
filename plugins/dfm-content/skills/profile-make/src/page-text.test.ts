import { describe, expect, it } from "vitest";
import { pageText } from "./page-text.ts";

describe("pageText", () => {
  it("keeps the words, one block a line", () => {
    const html = "<html><head><title>Coffee</title></head><body><h1>The coffee shop</h1><p>Iced coffee is <b>back</b>.</p></body></html>";
    expect(pageText(html)).toBe("The coffee shop\nIced coffee is back .");
  });

  it("leaves out scripts and styles", () => {
    expect(pageText("<p>Open at seven</p><script>track()</script><style>p{}</style>")).toBe("Open at seven");
  });

  it("puts back the common entities", () => {
    expect(pageText("<p>Cake &amp; coffee &quot;daily&quot;</p>")).toBe('Cake & coffee "daily"');
  });

  it("leaves out the menus and the footer", () => {
    expect(pageText("<nav><a>Sign in</a></nav><p>Open at seven</p><footer>Copyright</footer>")).toBe("Open at seven");
  });

  it("puts back named and numbered entities as their characters", () => {
    expect(pageText("<p>Next &rarr; &#8220;now&#8221;</p>")).toBe("Next \u2192 \u201Cnow\u201D");
  });
});
