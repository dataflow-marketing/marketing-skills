import { describe, expect, it } from "vitest";
import { factName } from "./fact-name.ts";

describe("factName", () => {
  it("takes the group off a count for one group", () => {
    expect(factName("emails sent [Keen]")).toBe("emails sent");
    expect(factName("visits")).toBe("visits");
  });
});
