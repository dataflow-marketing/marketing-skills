import { describe, expect, it } from "vitest";
import { fieldDefinitions } from "./field-definitions.ts";
import { readFieldValue, writeFieldValue } from "./field-value.ts";

const SITE = "https://coffee-shop.example";
const member = { id: "m1", email: "sam@coffee-shop.example", metafields: { custom: { online: ["Instagram", "Google"], kind: "a cafe", next: "spec 1" } } };
const send = async (url: string, init: RequestInit) => {
  if (url.endsWith("/members/metafields/custom/")) {
    return Response.json({ members_metafields: [{ key: "online", name: "Where are you online?", type: "list", settings: { options: ["Instagram", "Google", "LinkedIn"], multiple: true } }, { key: "kind", name: "What kind of business is it?", type: "text" }] });
  }
  if (init.method === "PUT") {
    const sent = JSON.parse(String(init.body)).members[0].metafields.custom;
    return Response.json({ members: [{ ...member, metafields: { custom: { ...member.metafields.custom, ...sent } } }] });
  }
  return Response.json({ members: [member] });
};

describe("fieldDefinitions", () => {
  it("reads each field's type and, for a pick list, its choices", async () => {
    expect(await fieldDefinitions(SITE, "t", send)).toEqual({
      ok: true,
      fields: [
        { key: "online", name: "Where are you online?", type: "list", options: ["Instagram", "Google", "LinkedIn"], multiple: true },
        { key: "kind", name: "What kind of business is it?", type: "text", multiple: false },
      ],
    });
  });
});

describe("readFieldValue and writeFieldValue", () => {
  it("read a list as a list and text as text; write one field only", async () => {
    expect(await readFieldValue(SITE, "Sam@coffee-shop.example", "online", "t", send)).toEqual({ ok: true, memberId: "m1", value: ["Instagram", "Google"] });
    expect(await readFieldValue(SITE, "sam@coffee-shop.example", "missing", "t", send)).toEqual({ ok: true, memberId: "m1", value: null });
    expect(await writeFieldValue(SITE, "m1", "online", ["LinkedIn"], "t", send)).toEqual({ ok: true, saved: ["LinkedIn"] });
  });
});
