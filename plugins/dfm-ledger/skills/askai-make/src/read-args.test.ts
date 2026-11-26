import { describe, expect, it } from "vitest";
import { readArgs } from "./read-args.ts";

describe("readArgs", () => {
  it("reads the ledger, settings, who, where to send and the profile", () => {
    expect(
      readArgs(["--ledger", "ledger.txt", "--settings", "s.txt", "--who", "the coffee shop", "--send-to", "hello@coffee-shop.example", "--profile", "profile.txt"]),
    ).toEqual({
      ok: true,
      args: { ledger: "ledger.txt", settings: "s.txt", who: "the coffee shop", sendTo: "hello@coffee-shop.example", profile: "profile.txt" },
    });
  });

  it("needs who the plan belongs to and where the response is sent", () => {
    expect(readArgs(["--ledger", "ledger.txt", "--settings", "s.txt"]).ok).toBe(false);
  });

  it("reads a template of the person's own", () => {
    const read = readArgs(["--ledger", "l.txt", "--settings", "s.txt", "--who", "Sam", "--send-to", "sam@example.test", "--instructions", "mine.txt"]);
    expect(read.ok && read.args.instructions).toBe("mine.txt");
  });
});
