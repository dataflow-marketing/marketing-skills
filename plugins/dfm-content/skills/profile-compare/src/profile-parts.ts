// A profile's parts, by label (spec/profile.md): the counted lines, the fourteen parts read from the site and how
// they write. Each part's text is kept as its lines; a part's label ends with a colon on a line of its own.

export const PARTS = [
  "counted",
  "what the site is and who it is for",
  "who is behind it",
  "who they speak to",
  "what it offers",
  "what they believe",
  "kinds of content and their shapes",
  "how titles and headlines are written",
  "how it is said",
  "words and phrases they use",
  "themes they come back to",
  "channels and tools they mention",
  "proof they show",
  "questions the site answers",
  "what it asks readers to do",
  "how they write",
] as const;

export type Parts = Map<string, string[]>;

export function profileParts(text: string): Parts {
  const parts: Parts = new Map();
  let current: string | undefined;

  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (line === "=== counted ===") {
      current = "counted";
      continue;
    }
    if (/^=== .+ ===$/.test(line)) {
      current = undefined;
      continue;
    }
    const label = line.endsWith(":") ? line.slice(0, -1) : undefined;
    if (label !== undefined && (PARTS as readonly string[]).includes(label)) {
      current = label;
      continue;
    }
    if (current !== undefined && line !== "") {
      parts.set(current, [...(parts.get(current) ?? []), line]);
    }
  }
  return parts;
}

// a part's text as its sentences: a change of one sentence shows as that sentence
export function sentencesOf(lines: readonly string[]): string[] {
  return lines.flatMap((line) => (line.startsWith('"') ? [line] : line.split(/(?<=[.!?])\s+(?=[A-Z"])/))).map((each) => each.trim()).filter((each) => each !== "");
}
