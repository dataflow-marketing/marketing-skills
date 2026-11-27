// What the inside and outside check needs from the graph (spec/market.md, Graph): offers and channels by name.

export type Named = { word: "offer" | "channel"; name: string };

const NAMED = /^(offer|channel) (.+?):/;

export function namedLines(graph: readonly string[]): Named[] {
  return graph.flatMap((line) => {
    const named = NAMED.exec(line.trim());
    return named ? [{ word: named[1] as Named["word"], name: named[2] }] : [];
  });
}
