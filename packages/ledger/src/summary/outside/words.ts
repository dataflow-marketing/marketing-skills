// Small ways of saying things in the summary's plain words.

export function listOf(items: readonly string[]): string {
  if (items.length <= 1) {
    return items.join("");
  }
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

export const PERIOD_WORDS = {
  week: { many: "weeks", one: "the week of", ones: "the weeks of" },
  "2 weeks": { many: "fortnights", one: "the fortnight from", ones: "the fortnights from" },
  month: { many: "months", one: "the month of", ones: "the months of" },
} as const;
