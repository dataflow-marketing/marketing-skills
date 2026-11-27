// The graph's lines about what a business is and shows (spec/ledger.md, Graph): read from inside or outside.
//   business <name>: <what it is, in a line>
//   site <address> (<how it is read>)          own
//   opens <when>: <hours> [<page>]            (no when: "opens: <hours>")
//   offer <name> (<kind>): <words> [<page>] until <date>
//   claim "<their words>": proof on the site | no proof on the site [<page>]
//   proof <name>: "<their words>" [<page>]
//   answers "<their question>" [<page>]
//   channel <name>: <words> [<page>]
// The source word has been taken off the end already (source-word.ts).

import type { SourceWord } from "./source-word.ts";

export type ThingWord = "business" | "site" | "own" | "opens" | "offer" | "claim" | "proof" | "answers" | "channel";

export type Thing = {
  word: ThingWord;
  name: string;
  words?: string;
  kind?: string;
  page?: string;
  until?: string;
  proved?: boolean;
  source: SourceWord;
  line: number;
};

const PAGE = /\s*\[([^\]\n]+)\]\s*$/;
const UNTIL = /\s+until (\d{4}-\d{2}-\d{2})\s*$/;
// the name may be empty when the site gives none: "opens: Open from seven" says no days
const NAMED = /^(business|opens|offer|proof|channel)(?: ([^:]*?))?(?: \(([^)]+)\))?:\s*(.*)$/;
const CLAIM = /^claim "([^"]+)": (proof on the site|no proof on the site)$/;
const ANSWERS = /^answers "([^"]+)"$/;
const SITE = /^site (\S+)(?: \(([^)]+)\))?$/;

export function readThing(text: string, source: SourceWord, line: number): Thing | undefined {
  const trimmed = text.trim();
  if (trimmed === "own") {
    return { word: "own", name: "own", source, line };
  }
  const site = SITE.exec(trimmed);
  if (site) {
    return { word: "site", name: site[1], ...(site[2] ? { kind: site[2] } : {}), source, line };
  }

  const { rest, page, until } = endsOf(trimmed);
  const claim = CLAIM.exec(rest);
  if (claim) {
    return withEnds({ word: "claim", name: claim[1], proved: claim[2] === "proof on the site", source, line }, page, until);
  }
  const answers = ANSWERS.exec(rest);
  if (answers) {
    return withEnds({ word: "answers", name: answers[1], source, line }, page, until);
  }
  const named = NAMED.exec(rest);
  if (named) {
    const thing: Thing = { word: named[1] as ThingWord, name: (named[2] ?? "").trim(), words: named[4].trim(), source, line };
    if (named[3]) {
      thing.kind = named[3];
    }
    return withEnds(thing, page, until);
  }
  return undefined;
}

// a line's page and until are at its end: "... [/questions/] until 2026-12-15"
function endsOf(text: string): { rest: string; page?: string; until?: string } {
  let rest = text;
  const until = UNTIL.exec(rest);
  if (until) {
    rest = rest.slice(0, until.index);
  }
  const page = PAGE.exec(rest);
  if (page) {
    rest = rest.slice(0, page.index);
  }
  return { rest: rest.trim(), page: page?.[1], until: until?.[1] };
}

function withEnds(thing: Thing, page?: string, until?: string): Thing {
  return { ...thing, ...(page ? { page } : {}), ...(until ? { until } : {}) };
}
