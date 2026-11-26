import { describe, expect, it } from "vitest";
import { checkReadBack } from "./check-read-back.ts";

const TEXT = "spec 1\ntime zone: Australia/Melbourne\nstore notes: file ~/x\n";

describe("checkReadBack", () => {
  it("finds nothing wrong when every line is there", () => {
    expect(checkReadBack(TEXT, ["store notes: file ~/x"])).toEqual([]);
  });

  it("names a missing line", () => {
    expect(checkReadBack(TEXT, ["store api: file ~/y"])).toEqual(["The settings file does not have the line: store api: file ~/y"]);
  });

  it("names a settings file that is not there", () => {
    expect(checkReadBack(undefined, [])).toEqual(["The settings file is not there."]);
  });
});
