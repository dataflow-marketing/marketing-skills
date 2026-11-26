// The ledger's text with its summary part written in: the old summary part is replaced (or one added at the end).
// Every line above the summary is kept exactly as it was.

const SUMMARY_HEADING = "=== summary ===";

export function putSummary(ledgerText: string, summary: string[]): string {
  const lines = ledgerText.replace(/\s+$/, "").split("\n");
  const at = lines.findIndex((line) => line.trim() === SUMMARY_HEADING);
  const above = at < 0 ? lines : lines.slice(0, at);
  const kept = above.join("\n").replace(/\s+$/, "");
  return `${kept}\n\n${SUMMARY_HEADING}\n${summary.join("\n")}\n`;
}

// the summary part of a ledger's text, line by line (none when it has no summary part)
export function summaryIn(ledgerText: string): string[] {
  const lines = ledgerText.replace(/\s+$/, "").split("\n");
  const at = lines.findIndex((line) => line.trim() === SUMMARY_HEADING);
  return at < 0 ? [] : lines.slice(at + 1);
}
