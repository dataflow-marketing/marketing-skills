import { describe, expect, it } from "vitest";
import { describeList } from "./describe-list.ts";

describe("describeList", () => {
  it("names each object, where it is and its version", () => {
    const text = describeList("ledger", [{ business: "acme", ok: true, where: "file acme.txt", version: "abc", lines: 3 }]).text;
    expect(text).toBe("ledger: 1 in settings\n\nledger of acme (3 lines)\n  where: file acme.txt\n  version: abc");
  });

  it("says an empty object is empty", () => {
    const text = describeList("ledger", [{ business: "acme", ok: true, where: "file acme.txt", version: "none", lines: 0 }]).text;
    expect(text).toContain("ledger of acme (empty)");
  });

  it("names the problem of an object that cannot be read", () => {
    const text = describeList("ledger", [{ business: "acme", ok: false, problem: "No member has the email." }]).text;
    expect(text).toContain("ledger of acme: cannot be read\n  problem: No member has the email.");
  });

  it("says where an object is kept when settings bind none of the kind", () => {
    expect(describeList("profile", []).text).toBe(
      "No profile is bound in settings. With no binding a profile is profile.txt in the working folder.",
    );
  });
});
