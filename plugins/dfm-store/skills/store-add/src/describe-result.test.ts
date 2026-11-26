import { describe, expect, it } from "vitest";
import { describeAdded, describePlan, describeReadBack } from "./describe-result.ts";

describe("describe-result", () => {
  it("shows the lines a write would add and how to write them", () => {
    const text = describePlan({ kind: "add", lines: ["store notes: file ~/x"], append: "" }, "s.txt").text;
    expect(text).toContain("Would add to s.txt:\nstore notes: file ~/x");
    expect(text).toContain("--go");
  });

  it("says a refusal and what is already there", () => {
    expect(describePlan({ kind: "refused", problem: "No." }, "s.txt").text).toBe("Refused: No.");
    expect(describePlan({ kind: "already there", lines: ["x"] }, "s.txt").text).toBe("Already in s.txt:\nx");
  });

  it("says what was added and points to store-check", () => {
    const text = describeAdded(["store notes: file ~/x"], "s.txt", []).text;
    expect(text).toContain("Added to s.txt and read back:");
    expect(text).toContain("dfm-store:store-check");
  });

  it("names what a read back found", () => {
    expect(describeReadBack(["x"], "s.txt", ["missing x"]).text).toBe("missing x");
  });
});
