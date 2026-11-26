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

  it("refuses the rest connector until it is built", () => {
    expect(planAdd(SETTINGS, { store: "api", connector: "rest", where: "https://api.example" })).toEqual({
      kind: "refused",
      problem: "The rest connector is not built yet. Use file or ghost.",
    });
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
