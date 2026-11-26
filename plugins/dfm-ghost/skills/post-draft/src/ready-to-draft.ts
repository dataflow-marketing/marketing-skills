// Says whether a words file may go to Ghost as a draft.
// Only a post goes, only in state draft or approved, only with words in its body.
// An idea is not written yet; a published piece is a person's to change, never a skill's.

import type { Words } from "./types.ts";

const READY_STATES = ["draft", "approved"];

// Ghost refuses a custom excerpt longer than this.
const GHOST_EXCERPT_LIMIT = 300;

export function readyToDraft(words: Words): string[] {
  const problems: string[] = [];

  if (words.kind !== "post") {
    problems.push(`kind is ${words.kind}: post-draft puts a post on Ghost, nothing else`);
  }
  if (!READY_STATES.includes(words.state)) {
    problems.push(`state is ${words.state}: only a draft or approved words file goes to Ghost`);
  }
  if (words.paragraphs.length === 0) {
    problems.push("the body is empty");
  }
  if (words.excerpt && words.excerpt.length > GHOST_EXCERPT_LIMIT) {
    problems.push(`the excerpt is ${words.excerpt.length} characters: Ghost takes ${GHOST_EXCERPT_LIMIT} at most`);
  }

  return problems;
}
