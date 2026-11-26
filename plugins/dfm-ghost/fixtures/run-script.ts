// Runs a skill's dist/run.js with Node alone (as Claude runs it) and gives back
// its exit code and everything it printed. post-draft is always run with the fake
// Ghost loaded first: nothing leaves the machine.

import { execFile } from "node:child_process";
import { promisify } from "node:util";

const run = promisify(execFile);
const PRELOAD = new URL("./fake-ghost-preload.ts", import.meta.url).href;

export type Ran = { code: number; stdout: string; stderr: string };

export type RunOptions = {
  cwd: string;
  fakeGhostFolder?: string;
  answerAs?: string;
};

export async function runScript(script: string, args: string[], options: RunOptions): Promise<Ran> {
  const nodeArgs = [script, ...args];
  const env: Record<string, string | undefined> = { ...process.env };
  if (options.fakeGhostFolder) {
    nodeArgs.unshift("--import", PRELOAD);
    env.FAKE_GHOST_FOLDER = options.fakeGhostFolder;
    env.FAKE_GHOST_ANSWER_AS = options.answerAs;
  }

  try {
    const { stdout, stderr } = await run("node", nodeArgs, { cwd: options.cwd, env });
    return { code: 0, stdout, stderr };
  } catch (error) {
    const failed = error as { code: number; stdout: string; stderr: string };
    return { code: failed.code, stdout: failed.stdout, stderr: failed.stderr };
  }
}
