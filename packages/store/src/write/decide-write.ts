// Decides what a change may do once the object has been read again just before writing (spec/store.md, every
// write, step 4). The store never merges: when the version has moved, it stops and the skill that made the change
// works it in again.
// Trailing white space is not a change: Ghost and editors differ on the last newline.

export type Decision =
  | { kind: "write" }
  | { kind: "nothing to change" }
  | { kind: "moved"; now: string }
  | { kind: "too large"; bytes: number; limit: number };

export type WriteCheck = {
  seenVersion: string;
  current: { text: string; version: string };
  proposed: string;
  // The largest body the store takes, in bytes; undefined for a store with no limit (a file)
  limit: number | undefined;
};

// The most a Ghost member field holds
export const GHOST_FIELD_LIMIT = 65535;

export function decideWrite(check: WriteCheck): Decision {
  if (check.current.version !== check.seenVersion) {
    return { kind: "moved", now: check.current.text };
  }
  if (sameText(check.current.text, check.proposed)) {
    return { kind: "nothing to change" };
  }
  const bytes = new TextEncoder().encode(check.proposed).length;
  if (check.limit !== undefined && bytes > check.limit) {
    return { kind: "too large", bytes, limit: check.limit };
  }
  return { kind: "write" };
}

// After the write: what the store kept must be what was sent
export function readBackProblems(sent: string, kept: string | undefined): string[] {
  if (kept === undefined) {
    return ["The object is not there after the write."];
  }
  if (!sameText(sent, kept)) {
    return ["What the store kept is not what was sent."];
  }
  return [];
}

export function sameText(one: string, other: string): boolean {
  return one.trimEnd() === other.trimEnd();
}
