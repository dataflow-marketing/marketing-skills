import { homedir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { expandHome } from "./expand-home.ts";

describe("expandHome", () => {
  it("turns ~ into the home folder", () => {
    expect(expandHome("~/.config/dfm/.env")).toBe(join(homedir(), ".config/dfm/.env"));
  });

  it("leaves other paths alone", () => {
    expect(expandHome("/srv/dfm/settings.txt")).toBe("/srv/dfm/settings.txt");
  });
});
