import { describe, expect, it } from "vitest";
import { runLogPath } from "./run-log-path.ts";

describe("runLogPath", () => {
  it("is run-log.txt beside the settings file", () => {
    expect(runLogPath("/srv/dfm/settings.txt")).toBe("/srv/dfm/run-log.txt");
  });

  it("is the path given when one is given", () => {
    expect(runLogPath("/srv/dfm/settings.txt", "/srv/logs/dfm.txt")).toBe("/srv/logs/dfm.txt");
  });
});
