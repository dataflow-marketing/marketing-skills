import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { appendRunLine } from "./append-run-line.ts";

let folder = "";

beforeAll(async () => {
  folder = await mkdtemp(join(tmpdir(), "dfm-core-"));
});

afterAll(async () => {
  await rm(folder, { recursive: true, force: true });
});

describe("appendRunLine", () => {
  it("adds one line each write", async () => {
    const runLog = join(folder, "run.log");
    const entry = {
      when: new Date("2026-11-24T22:30:00Z"),
      skill: "dfm-ghost:post-draft",
      what: "post draft",
      where: "ghost coffee-shop",
      before: "",
      after: "draft",
    };
    await appendRunLine(runLog, entry);
    await appendRunLine(runLog, entry);
    const lines = (await readFile(runLog, "utf8")).trimEnd().split("\n");
    expect(lines.length).toBe(2);
  });
});
