// The read's counts, from profile-make's counted part: "pages: 6, posts: 9 (in the sitemap)".

export type ReadCounts = { pages: number; posts: number };

const COUNTS = /pages: (\d+), posts: (\d+)/;

export function readCounts(countedText: string): ReadCounts | undefined {
  const found = COUNTS.exec(countedText);
  if (!found) {
    return undefined;
  }
  return { pages: Number(found[1]), posts: Number(found[2]) };
}
