// What the summary and the inside and outside check need from the graph (spec/market.md, Graph).

export type Named = { word: "offer" | "channel"; name: string };

const NO_PROOF = /^claim "(.+)": no proof on the site\b/;
const UNTIL = /^offer (.+?): .* until (\d{4}-\d{2}-\d{2})\b/;
const NAMED = /^(offer|channel) (.+?):/;

export function claimsWithNoProof(graph: readonly string[]): string[] {
  return graph.flatMap((line) => NO_PROOF.exec(line.trim())?.[1] ?? []).map((words) => `"${words}"`);
}

export function offersEnded(graph: readonly string[], asAt: string): string[] {
  const ended: string[] = [];
  for (const line of graph) {
    const offer = UNTIL.exec(line.trim());
    if (offer && offer[2] < asAt) {
      ended.push(`${offer[1]} on ${offer[2]}`);
    }
  }
  return ended;
}

export function namedLines(graph: readonly string[]): Named[] {
  return graph.flatMap((line) => {
    const named = NAMED.exec(line.trim());
    return named ? [{ word: named[1] as Named["word"], name: named[2] }] : [];
  });
}
