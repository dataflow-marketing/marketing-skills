// The lines a change takes out and puts in, for a person to read before saying yes.
// A longest common run of lines is kept; what is left is shown as "- " (taken out) and "+ " (put in), in order,
// a line taken out before the line put in its place.

export type LineChanges = { lines: string[]; out: number; in: number };

export function lineChanges(before: string, after: string): LineChanges {
  const old = linesOf(before);
  const next = linesOf(after);
  const kept = keptTable(old, next);
  const lines: string[] = [];
  let i = 0;
  let j = 0;
  while (i < old.length || j < next.length) {
    if (i < old.length && j < next.length && old[i] === next[j]) {
      i += 1;
      j += 1;
    } else if (j < next.length && (i === old.length || kept[i][j + 1] > kept[i + 1][j])) {
      lines.push(`+ ${next[j]}`);
      j += 1;
    } else {
      lines.push(`- ${old[i]}`);
      i += 1;
    }
  }
  return { lines, out: lines.filter((line) => line.startsWith("- ")).length, in: lines.filter((line) => line.startsWith("+ ")).length };
}

function linesOf(text: string): string[] {
  const trimmed = text.trimEnd();
  return trimmed === "" ? [] : trimmed.split(/\r?\n/);
}

// kept[i][j]: how many lines old[i..] and next[j..] share in order
function keptTable(old: string[], next: string[]): number[][] {
  const kept = Array.from({ length: old.length + 1 }, () => new Array<number>(next.length + 1).fill(0));
  for (let i = old.length - 1; i >= 0; i -= 1) {
    for (let j = next.length - 1; j >= 0; j -= 1) {
      kept[i][j] = old[i] === next[j] ? kept[i + 1][j + 1] + 1 : Math.max(kept[i + 1][j], kept[i][j + 1]);
    }
  }
  return kept;
}
