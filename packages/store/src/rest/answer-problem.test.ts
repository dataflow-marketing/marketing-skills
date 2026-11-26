import { describe, expect, it } from "vitest";
import { answerProblem } from "./answer-problem.ts";

describe("answerProblem", () => {
  it("says what a refused key means", () => {
    expect(answerProblem("https://store.example", "read the ledger coffee-shop", 401)).toBe(
      "The store at https://store.example refused the key (401). Check the key named in settings is the store's key. It was asked to read the ledger coffee-shop.",
    );
  });

  it("gives the status of anything else", () => {
    expect(answerProblem("https://store.example", "give its limit", 500)).toBe("The store at https://store.example answered 500. It was asked to give its limit.");
  });
});
