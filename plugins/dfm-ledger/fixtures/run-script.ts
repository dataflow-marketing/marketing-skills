// Runs a skill's dist/run.js with Node alone (as Claude runs it) and gives back
// its exit code and everything it printed.

import { execFile } from "node:child_process";
import { promisify } from "node:util";

const run = promisify(execFile);

export type Ran = { code: number; stdout: string; stderr: string };

export async function runScript(script: string, args: string[], cwd: string): Promise<Ran> {
  try {
    const { stdout, stderr } = await run("node", [script, ...args], { cwd });
    return { code: 0, stdout, stderr };
  } catch (error) {
    const failed = error as { code: number; stdout: string; stderr: string };
    return { code: failed.code, stdout: failed.stdout, stderr: failed.stderr };
  }
}
