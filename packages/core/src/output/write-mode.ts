// Every writing script has the same three modes:
// --preview shows what would be written and writes nothing,
// --go writes, --read-back checks what was written.
// With no mode named a script previews: the safe choice is the default.
// Naming two modes is a problem, never guessed at.

export type WriteMode = "preview" | "go" | "read-back";

export type WriteModeResult = { ok: true; mode: WriteMode } | { ok: false; problem: string };

const MODE_FLAGS: Record<string, WriteMode> = {
  "--preview": "preview",
  "--go": "go",
  "--read-back": "read-back",
};

export function writeMode(args: readonly string[]): WriteModeResult {
  const named: WriteMode[] = [];
  for (const arg of args) {
    const mode = MODE_FLAGS[arg];
    if (mode) {
      named.push(mode);
    }
  }

  if (named.length > 1) {
    return { ok: false, problem: "Name one mode only: --preview, --go or --read-back." };
  }
  if (named.length === 1) {
    return { ok: true, mode: named[0] };
  }
  return { ok: true, mode: "preview" };
}

export function isModeFlag(arg: string): boolean {
  return arg in MODE_FLAGS;
}
