// Node edge: appends one line to the run log file.

import { appendFile } from "node:fs/promises";
import { formatRunLine } from "../run-log/format-run-line.ts";
import type { RunLogEntry } from "../run-log/format-run-line.ts";
import { expandHome } from "./expand-home.ts";

export async function appendRunLine(runLogPath: string, entry: RunLogEntry): Promise<void> {
  const line = formatRunLine(entry);
  await appendFile(expandHome(runLogPath), `${line}\n`, "utf8");
}
