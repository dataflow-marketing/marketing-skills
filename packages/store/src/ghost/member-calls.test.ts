import { describe, expect, it } from "vitest";
import { changeBody, fieldText, fieldsUrl, headersFor, memberUrl, membersByEmailUrl } from "./member-calls.ts";

const SITE = "https://coffee-shop.example";

describe("the Ghost member calls", () => {
  it("send the token and the API version; JSON only when sending", () => {
    expect(headersFor("t.o.k")).toEqual({ Authorization: "Ghost t.o.k", "Accept-Version": "v6.0" });
    expect(headersFor("t.o.k", true)["Content-Type"]).toBe("application/json");
  });

  it("read the site's custom fields", () => {
    expect(fieldsUrl(SITE)).toBe("https://coffee-shop.example/ghost/api/admin/members/metafields/custom/");
  });

  it("find members by email with their fields, two at most", () => {
    expect(membersByEmailUrl(SITE, "owner@coffee-shop.example")).toBe(
      "https://coffee-shop.example/ghost/api/admin/members/?filter=email%3A'owner%40coffee-shop.example'&include=metafields&limit=2",
    );
  });

  it("keep a quote in an email inside the filter", () => {
    expect(decodeURIComponent(membersByEmailUrl(SITE, "o'neil@x.example"))).toContain("email:'o\\'neil@x.example'");
  });

  it("read and change one member by id", () => {
    expect(memberUrl(SITE, "m1")).toBe("https://coffee-shop.example/ghost/api/admin/members/m1/?include=metafields");
  });

  it("change the one field only; null clears it", () => {
    expect(JSON.parse(changeBody("next", "goal: 100"))).toEqual({ members: [{ metafields: { custom: { next: "goal: 100" } } }] });
    expect(JSON.parse(changeBody("next", ""))).toEqual({ members: [{ metafields: { custom: { next: null } } }] });
  });

  it("read a missing or null field as empty", () => {
    expect(fieldText({ metafields: { custom: { next: "x" } } }, "next")).toBe("x");
    expect(fieldText({ metafields: { custom: { next: null } } }, "next")).toBe("");
    expect(fieldText({}, "next")).toBe("");
  });
});
