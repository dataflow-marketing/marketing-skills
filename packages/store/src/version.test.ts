import { describe, expect, it } from "vitest";
import { NO_VERSION, versionOf } from "./version.ts";

describe("versionOf", () => {
  it("is the SHA-256 of the text in lowercase hex", async () => {
    expect(await versionOf("abc")).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
  });

  it("is none for an empty or missing object", async () => {
    expect(await versionOf("")).toBe(NO_VERSION);
    expect(await versionOf(undefined)).toBe(NO_VERSION);
  });

  it("changes when one character changes", async () => {
    expect(await versionOf("goal: 100")).not.toBe(await versionOf("goal: 101"));
  });

  it("reads the text as UTF-8", async () => {
    expect(await versionOf("\u2192")).toBe(await versionOf("\u2192"));
    expect(await versionOf("\u2192")).not.toBe(await versionOf("->"));
  });
});
