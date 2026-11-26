// Reads a words file in the shape of spec/words.md:
// "spec 1", then one "field: value" a line, then "=== body ===" and the body,
// one paragraph per block with a blank line between.
// Pure: takes the text, gives back the words or every problem found.

import type { Words } from "./types.ts";

export type WordsResult = { ok: true; words: Words } | { ok: false; problems: string[] };

const SPEC_LINE = "spec 1";
const BODY_MARKER = "=== body ===";
const FIELD_LINE = /^([a-z]+): (.*)$/;
const FIELDS = ["kind", "state", "title", "excerpt", "channel", "topic", "for", "ask", "campaign", "link", "from", "tags"];
const REQUIRED = ["kind", "state", "channel", "from"];
const KINDS = ["post", "email", "share", "message"];
const STATES = ["idea", "draft", "approved", "published"];

export function readWords(text: string): WordsResult {
  const lines = text.split(/\r?\n/);
  const problems: string[] = [];

  if (lines[0]?.trim() !== SPEC_LINE) {
    problems.push(`line 1: expected "${SPEC_LINE}"`);
  }
  const bodyAt = lines.findIndex((line) => line.trim() === BODY_MARKER);
  if (bodyAt < 0) {
    problems.push(`no "${BODY_MARKER}" line`);
    return { ok: false, problems };
  }

  const fields = readFields(lines.slice(1, bodyAt), problems);
  checkFields(fields, problems);
  if (problems.length > 0) {
    return { ok: false, problems };
  }

  const paragraphs = readParagraphs(lines.slice(bodyAt + 1).join("\n"));
  return { ok: true, words: toWords(fields, paragraphs) };
}

function readFields(header: string[], problems: string[]): Record<string, string> {
  const fields: Record<string, string> = {};
  header.forEach((rawLine, index) => {
    const line = rawLine.trim();
    if (line === "") {
      return;
    }
    const match = FIELD_LINE.exec(line);
    if (!match || !FIELDS.includes(match[1])) {
      problems.push(`line ${index + 2}: not understood: ${line}`);
      return;
    }
    fields[match[1]] = match[2].trim();
  });
  return fields;
}

function checkFields(fields: Record<string, string>, problems: string[]): void {
  for (const field of REQUIRED) {
    if (!fields[field]) {
      problems.push(`no ${field}: it is required`);
    }
  }
  if (fields.kind && !KINDS.includes(fields.kind)) {
    problems.push(`kind ${fields.kind} is not one of ${KINDS.join(", ")}`);
  }
  if (fields.state && !STATES.includes(fields.state)) {
    problems.push(`state ${fields.state} is not one of ${STATES.join(", ")}`);
  }
  const needsTitle = fields.kind === "post" || fields.kind === "email";
  if (needsTitle && !fields.title) {
    problems.push(`no title: a ${fields.kind} needs one`);
  }
}

function readParagraphs(body: string): string[] {
  const paragraphs: string[] = [];
  for (const block of body.split(/\n\s*\n/)) {
    const paragraph = block.trim();
    if (paragraph !== "") {
      paragraphs.push(paragraph);
    }
  }
  return paragraphs;
}

function readTags(tags: string | undefined): string[] {
  if (!tags) {
    return [];
  }
  const names: string[] = [];
  for (const tag of tags.split(",")) {
    const name = tag.trim();
    if (name !== "") {
      names.push(name);
    }
  }
  return names;
}

function toWords(fields: Record<string, string>, paragraphs: string[]): Words {
  const words: Words = {
    kind: fields.kind,
    state: fields.state,
    channel: fields.channel,
    from: fields.from,
    tags: readTags(fields.tags),
    paragraphs,
  };
  if (fields.title) {
    words.title = fields.title;
  }
  if (fields.excerpt) {
    words.excerpt = fields.excerpt;
  }
  if (fields.link) {
    words.link = fields.link;
  }
  return words;
}
