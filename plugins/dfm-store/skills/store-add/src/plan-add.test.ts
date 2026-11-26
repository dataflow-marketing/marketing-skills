import { describe, expect, it } from "vitest";
import { planAdd } from "./plan-add.ts";

const SETTINGS = `spec 1
time zone: Australia/Melbourne
site coffee-shop: ghost https://coffee-shop.example key in COFFEE_SHOP_GHOST_ADMIN_KEY
keys file: ~/.config/dfm/.env
`;

const BINDING = { object: "ledger", business: "coffee-shop", place: "owner@coffee-shop.example next" };

describe("planAdd", () => {
  it("adds a Ghost store and a binding to it", () => {
    expect(planAdd(SETTINGS, { store: "members", connector: "ghost", where: "coffee-shop", binding: BINDING })).toEqual({
      kind: "add",
      lines: ["store members: ghost coffee-shop", "binding ledger coffee-shop: members owner@coffee-shop.example next"],
      append: "store members: ghost coffee-shop\nbinding ledger coffee-shop: members owner@coffee-shop.example next\n",
    });
  });

  it("adds a file store", () => {
    expect(planAdd(SETTINGS, { store: "notes", connector: "file", where: "~/dfm/ledgers" })).toMatchObject({
      kind: "add",
      lines: ["store notes: file ~/dfm/ledgers"],
    });
  });

  it("adds a binding only to a store already listed", () => {
    const text = `${SETTINGS}store members: ghost coffee-shop\n`;
    expect(planAdd(text, { store: "members", binding: BINDING })).toMatchObject({
      kind: "add",
      lines: ["binding ledger coffee-shop: members owner@coffee-shop.example next"],
    });
  });

  it("leaves lines already there alone", () => {
    const text = `${SETTINGS}store members: ghost coffee-shop\n`;
    expect(planAdd(text, { store: "members", connector: "ghost", where: "coffee-shop" })).toEqual({
      kind: "already there",
      lines: ["store members: ghost coffee-shop"],
    });
  });

  it("refuses a different store of the same name", () => {
    const text = `${SETTINGS}store members: file ~/x\n`;
    expect(planAdd(text, { store: "members", connector: "ghost", where: "coffee-shop" }).kind).toBe("refused");
  });

  it("refuses an object already bound elsewhere", () => {
    const text = `${SETTINGS}store notes: file ~/x\nstore members: ghost coffee-shop\nbinding ledger coffee-shop: notes ledger.txt\n`;
    const plan = planAdd(text, { store: "members", binding: BINDING });
    expect(plan).toMatchObject({ kind: "refused" });
    expect(plan.kind === "refused" && plan.problem).toContain("moving it is not adding it");
  });

  it("refuses a Ghost store for a site settings do not have", () => {
    expect(planAdd(SETTINGS, { store: "members", connector: "ghost", where: "bakery" })).toEqual({
      kind: "refused",
      problem: "Settings have no Ghost site called bakery. Add it with dfm-ghost:site-add first.",
    });
  });

  it("adds a rest store with the variable that holds its key plus a binding by the business's name", () => {
    const request = { store: "api", connector: "rest", where: "https://api.example/", keyName: "COFFEE_SHOP_STORE_KEY" };
    expect(planAdd(SETTINGS, { ...request, binding: { object: "ledger", business: "coffee-shop", place: "coffee-shop" } })).toEqual({
      kind: "add",
      lines: ["store api: rest https://api.example key in COFFEE_SHOP_STORE_KEY", "binding ledger coffee-shop: api coffee-shop"],
      append: "store api: rest https://api.example key in COFFEE_SHOP_STORE_KEY\nbinding ledger coffee-shop: api coffee-shop\n",
    });
  });

  it("leaves a rest store already there alone", () => {
    const text = `${SETTINGS}store api: rest https://api.example key in COFFEE_SHOP_STORE_KEY\n`;
    const request = { store: "api", connector: "rest", where: "https://api.example", keyName: "COFFEE_SHOP_STORE_KEY" };
    expect(planAdd(text, request).kind).toBe("already there");
  });

  it("refuses a rest store with no key name", () => {
    expect(planAdd(SETTINGS, { store: "api", connector: "rest", where: "https://api.example" })).toEqual({
      kind: "refused",
      problem: "A rest store needs --key-name: the variable in the keys file that holds its key, in capitals, such as COFFEE_SHOP_STORE_KEY.",
    });
  });

  it("refuses a rest store that is not https", () => {
    const request = { store: "api", connector: "rest", where: "http://api.example", keyName: "COFFEE_SHOP_STORE_KEY" };
    expect(planAdd(SETTINGS, request)).toEqual({
      kind: "refused",
      problem: 'The address of the store "api" is not https:// (or http://localhost for a Worker on this computer): http://api.example',
    });
  });

  it("refuses a key name on a Ghost store", () => {
    const plan = planAdd(SETTINGS, { store: "members", connector: "ghost", where: "coffee-shop", keyName: "X" });
    expect(plan.kind).toBe("refused");
  });

  it("refuses a rest binding whose place is not an id", () => {
    const request = { store: "api", connector: "rest", where: "https://api.example", keyName: "COFFEE_SHOP_STORE_KEY" };
    expect(planAdd(SETTINGS, { ...request, binding: BINDING }).kind).toBe("refused");
  });

  it("refuses a Ghost binding whose place is not an email and a field", () => {
    const plan = planAdd(SETTINGS, { store: "members", connector: "ghost", where: "coffee-shop", binding: { ...BINDING, place: "next" } });
    expect(plan.kind).toBe("refused");
  });

  it("refuses with no settings file, pointing to a site skill", () => {
    expect(planAdd(undefined, { store: "members", connector: "ghost", where: "coffee-shop" })).toMatchObject({ kind: "refused" });
  });

  it("refuses a binding to a store that is not there", () => {
    expect(planAdd(SETTINGS, { store: "members", binding: BINDING })).toEqual({
      kind: "refused",
      problem: "There is no store called members. Add it with --connector and --where.",
    });
  });

  it("refuses a request with nothing to add", () => {
    expect(planAdd(SETTINGS, { store: "members" }).kind).toBe("refused");
  });
});
