// What changed in a profile between two reads, part by part: each sentence that went and each that came. And several
// businesses side by side: each part, then what each profile says in it. Pure; a person or Claude summarises from it.

import { PARTS, profileParts, sentencesOf } from "./profile-parts.ts";

export type PartChange = { part: string; out: string[]; in: string[] };

export type OverTime = { changed: PartChange[]; same: string[] };

export function overTime(before: string, after: string): OverTime {
  const was = profileParts(before);
  const now = profileParts(after);
  const result: OverTime = { changed: [], same: [] };

  for (const part of PARTS) {
    const old = sentencesOf(was.get(part) ?? []);
    const neu = sentencesOf(now.get(part) ?? []);
    const out = old.filter((sentence) => !neu.includes(sentence));
    const came = neu.filter((sentence) => !old.includes(sentence));
    if (out.length === 0 && came.length === 0) {
      result.same.push(part);
    } else {
      result.changed.push({ part, out, in: came });
    }
  }
  return result;
}

export function overTimeText(names: { before: string; after: string }, result: OverTime): string {
  const lines = [`what changed from ${names.before} to ${names.after}:`, ""];
  if (result.changed.length === 0) {
    lines.push("nothing changed");
  }
  for (const change of result.changed) {
    lines.push(`${change.part}:`, ...change.out.map((sentence) => `- ${sentence}`), ...change.in.map((sentence) => `+ ${sentence}`), "");
  }
  lines.push(`the same: ${result.same.length} of ${PARTS.length} parts`);
  return lines.join("\n");
}

export type Named = { name: string; text: string };

export function sideBySideText(profiles: readonly Named[]): string {
  const parsed = profiles.map((profile) => ({ name: profile.name, parts: profileParts(profile.text) }));
  const lines: string[] = [];
  for (const part of PARTS) {
    lines.push(`## ${part}`);
    for (const profile of parsed) {
      lines.push(`${profile.name}: ${(profile.parts.get(part) ?? ["(nothing)"]).join(" ")}`);
    }
    lines.push("");
  }
  return lines.join("\n");
}
