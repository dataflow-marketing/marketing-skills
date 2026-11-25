import { describe, expect, it } from "vitest";
import { settingsPathFrom } from "./settings-path-from.ts";

describe("settingsPathFrom", () => {
  it("takes the first argument that is not a flag", () => {
    expect(settingsPathFrom(["--json", "settings.txt"])).toBe("settings.txt");
    expect(settingsPathFrom(["--json"])).toBeUndefined();
  });
});
