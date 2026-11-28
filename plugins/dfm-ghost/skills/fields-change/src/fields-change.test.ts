import { describe, expect, it } from "vitest";
import { chosenValue } from "./chosen-value.ts";
import { holdsAnObject } from "./held-field.ts";
import { planFieldChange } from "./plan-field-change.ts";

const ONLINE = { key: "online", name: "Where are you online?", type: "list", options: ["Instagram", "Google", "LinkedIn"], multiple: true };
const KIND = { key: "kind", name: "What kind of business is it?", type: "text", multiple: false };

describe("chosenValue", () => {
  it("takes a pick list's choices word for word, as a list", () => {
    expect(chosenValue(ONLINE, "Google | LinkedIn")).toEqual({ ok: true, value: ["Google", "LinkedIn"] });
    expect(chosenValue({ ...ONLINE, multiple: false }, "Google")).toEqual({ ok: true, value: ["Google"] });
  });

  it("refuses what is not a choice; takes text as text; empty clears", () => {
    expect(chosenValue(ONLINE, "google").ok).toBe(false);
    expect(chosenValue(ONLINE, "Google | Facebook")).toEqual({ ok: false, problem: '"Facebook" is not a choice for online. Its choices, word for word: Instagram / Google / LinkedIn.' });
    expect(chosenValue(KIND, " a cafe ")).toEqual({ ok: true, value: "a cafe" });
    expect(chosenValue(KIND, "")).toEqual({ ok: true, value: null });
  });
});

describe("holdsAnObject", () => {
  it("finds a field that holds a ledger bound in settings", () => {
    const bindings = [{ object: "ledger", business: "coffee-shop", store: "members", place: "sam@coffee-shop.example next" }];
    expect(holdsAnObject(bindings, "next")?.business).toBe("coffee-shop");
    expect(holdsAnObject(bindings, "online")).toBeUndefined();
  });
});

describe("planFieldChange", () => {
  const send = async (url: string) =>
    url.endsWith("/members/metafields/custom/")
      ? Response.json({ members_metafields: [{ key: "online", name: ONLINE.name, type: "list", settings: { options: ONLINE.options, multiple: true } }] })
      : Response.json({ members: [{ id: "m1", email: "sam@coffee-shop.example", metafields: { custom: { online: ["Instagram"] } } }] });

  it("gives what the field holds, its version and what would be sent", async () => {
    const planned = await planFieldChange({ address: "https://coffee-shop.example", token: "t", email: "sam@coffee-shop.example", field: "online", value: "Instagram | Google" }, send);
    expect(planned.ok && [planned.plan.memberId, planned.plan.now, planned.plan.next, planned.plan.version.length]).toEqual(["m1", ["Instagram"], ["Instagram", "Google"], 64]);
  });

  it("refuses a field the site does not have", async () => {
    const planned = await planFieldChange({ address: "https://coffee-shop.example", token: "t", email: "sam@coffee-shop.example", field: "shoe size", value: "9" }, send);
    expect(planned).toEqual({ ok: false, problem: "The site has no member field called shoe size. Its fields: online." });
  });
});
