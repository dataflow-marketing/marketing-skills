import { describe, expect, it } from "vitest";
import { pageTitle } from "./page-title.ts";

describe("pageTitle", () => {
  it("takes the page's title", () => {
    expect(pageTitle("<head><title> Iced coffee &amp; cake </title></head>", "https://coffee-shop.example/a/")).toBe(
      "Iced coffee & cake",
    );
  });

  it("uses the address when there is no title", () => {
    expect(pageTitle("<p>hi</p>", "https://coffee-shop.example/a/")).toBe("https://coffee-shop.example/a/");
  });
});
