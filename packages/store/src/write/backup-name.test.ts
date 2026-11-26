import { describe, expect, it } from "vitest";
import { backupName } from "./backup-name.ts";

describe("backupName", () => {
  it("names the kind, the business and the time in the settings time zone", () => {
    const now = new Date("2026-11-26T10:05:09Z");
    expect(backupName("ledger", "coffee-shop", "Australia/Melbourne", now)).toBe("ledger-coffee-shop-2026-11-26-210509.txt");
  });

  it("uses the date where the business is", () => {
    const now = new Date("2026-11-26T14:00:00Z");
    expect(backupName("profile", "acme", "Australia/Melbourne", now)).toBe("profile-acme-2026-11-27-010000.txt");
  });
});
