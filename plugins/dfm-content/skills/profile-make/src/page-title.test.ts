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

  it("puts back the entities in a title, numbered ones too", () => {
    expect(pageTitle("<title>November&#x27;s guest &amp; more</title>", "http://localhost:4104/")).toBe("November's guest & more");
    expect(pageTitle("<title>Tea &#39;n&#8217; cake</title>", "u")).toBe("Tea 'n\u2019 cake");
  });
});
