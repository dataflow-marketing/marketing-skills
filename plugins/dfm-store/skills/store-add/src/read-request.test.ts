import { describe, expect, it } from "vitest";
import { readRequest } from "./read-request.ts";

describe("readRequest", () => {
  it("reads a store and a binding", () => {
    const values = { "--store": "members", "--connector": "ghost", "--where": "acme", "--object": "ledger", "--business": "acme", "--place": "a@b.example next" };
    expect(readRequest(values)).toEqual({
      ok: true,
      request: { store: "members", connector: "ghost", where: "acme", binding: { object: "ledger", business: "acme", place: "a@b.example next" } },
    });
  });

  it("reads a binding alone", () => {
    expect(readRequest({ "--store": "members", "--object": "ledger", "--business": "acme", "--place": "a@b.example next" })).toMatchObject({
      ok: true,
      request: { store: "members" },
    });
  });

  it("refuses part of a binding", () => {
    expect(readRequest({ "--store": "members", "--object": "ledger" })).toEqual({ ok: false, problem: "A binding needs --object, --business and --place." });
  });

  it("refuses --where with no connector", () => {
    expect(readRequest({ "--store": "members", "--where": "acme" }).ok).toBe(false);
  });
});
