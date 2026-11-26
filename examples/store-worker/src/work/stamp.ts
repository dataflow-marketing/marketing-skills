// A new version and the time of a write. Every write gets a fresh stamp: a version is never reused, even for an
// object removed and added again.

export type Stamp = {
  version: string;
  updated: string;
};

export function newStamp(): Stamp {
  return {
    version: crypto.randomUUID(),
    updated: new Date().toISOString(),
  };
}
