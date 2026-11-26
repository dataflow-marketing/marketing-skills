import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { readInputs } from "./read-inputs.ts";
import { ICED_COFFEE_WORDS, PASSED_REPORT } from "../../../../fixtures/coffee-shop.ts";

describe("readInputs", () => {
  it("reads the words and the report and says the report is newer", async () => {
    const folder = await mkdtemp(join(tmpdir(), "dfm-inputs-"));
    await writeFile(join(folder, "words.txt"), ICED_COFFEE_WORDS);
    await writeFile(join(folder, "report.txt"), PASSED_REPORT);

    const read = await readInputs(join(folder, "words.txt"), join(folder, "report.txt"));
    expect(read).toEqual({ ok: true, inputs: { wordsText: ICED_COFFEE_WORDS, reportText: PASSED_REPORT, reportIsNewer: true } });
  });

  it("fails on a file it cannot read", async () => {
    const read = await readInputs("/no/such/words.txt", undefined);
    expect(read.ok).toBe(false);
  });
});
