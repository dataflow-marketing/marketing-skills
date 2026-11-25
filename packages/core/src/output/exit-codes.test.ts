import { describe, expect, it } from "vitest";
import { EXIT_DONE, EXIT_PROBLEMS_FOUND, EXIT_REFUSED_OR_FAILED } from "./exit-codes.ts";

describe("exit codes", () => {
  it("are 0 done, 1 problems found, 2 refused or failed", () => {
    expect([EXIT_DONE, EXIT_PROBLEMS_FOUND, EXIT_REFUSED_OR_FAILED]).toEqual([0, 1, 2]);
  });
});
