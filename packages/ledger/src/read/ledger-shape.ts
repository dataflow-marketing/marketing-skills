// A ledger once it is read (spec/ledger.md): its graph, plan and done parts as data.
// The field names are the ones dfm has used since November 2026: the ledger pieces
// (carry forward, the forecast) take what the reader gives them as it is.
// Every line keeps its line number in the ledger.

// ---- graph ----

export type Label = "proven" | "believed" | "assumed" | "unknown";

// a step or a fact, with an optional group: `new post [Regulars]`
export type Part = { name: string; group?: string };

// a link's rate: `?`, `from people`, `like offers to share`, `8 of 41`, `1 to 3 of 10`, `11 from 2 posts`
export type Result =
  | { kind: "unknown" }
  | { kind: "people" }
  | { kind: "like"; name: string }
  | { kind: "of" | "from"; low: number; high: number; out: number; unit: string; weeks: number; each?: number[] };

export type Link = {
  from: Part[];
  to: string;
  result: Result;
  // in weeks: 0 is the same week, "?" was never measured
  within: number | "?";
  label?: Label;
  downside: boolean;
  line: number;
};

export type Fact = { fact: string; source: string; line: number };

export type GroupRule =
  | { kind: "tag"; tag: string }
  | { kind: "status"; status: "paid" | "free" | "comped" }
  | { kind: "has"; field: string }
  | { kind: "opened"; k: number; n: number }
  | { kind: "answered"; field: string }
  | { kind: "field"; field: string; value: string }
  | { kind: "joined"; source: string }
  | { kind: "email"; ends: string };

export type Group = { name: string; rule: GroupRule; line: number };
export type When = { when: string; event: string; line: number };
export type Remove = { from: Part[]; to: string; line: number };
export type Area = { name: string; members: string[]; line: number };
export type Icon = { icon: string; members: string[]; line: number };
export type Frequency = "daily" | "weekly" | "monthly" | "quarterly" | "yearly";

export type Graph = {
  extends?: string;
  cycle?: Frequency;
  facts: Fact[];
  groups: Group[];
  links: Link[];
  whens: When[];
  removes: Remove[];
  areas: Area[];
  icons: Icon[];
};

// ---- plan ----

// a goal: a total by a date (`want followers 20 by 2027-02-14`) or a rate (`want followers +1 a week`)
export type Want = { fact: string; n?: number; by?: string; per?: { n: number; every: "week" | "month" } };

// `every week new post`, from the plan's start or from a later date
export type Repeat = { every: "week"; methods: Part[]; from?: string; line: number };

// a dated line: "=" planned, "+" added that week, "-" taken off that week
export type Entry = { date: string; op: "=" | "+" | "-"; methods: Part[]; line: number };

export type Plan = {
  extends?: string;
  start?: string;
  want?: Want;
  repeats: Repeat[];
  hows: Record<string, string>;
  scripts: Record<string, string[]>;
  // a week's own how or script, keyed by the week's Monday
  weekHows: Record<string, Record<string, string>>;
  weekScripts: Record<string, Record<string, string[]>>;
  entries: Entry[];
};

// ---- done ----

export type Answer = "done" | "not done";

// what went out: the channel or way, the day, its title, link, who it was for and a summary
// topic: what the content is about; optional, unknown when there is none
export type Said = { how: string; on: string; title: string; url: string; for: string[]; topic?: string; summary: string };

// each week is keyed by the date its lines are written with
export type DoneWeek = {
  answers: Record<string, Answer>;
  when?: Record<string, string>;
  totals: Record<string, number>;
  counts?: Record<string, number>;
  countedTo?: string;
  said?: Said[];
};

// one fact count or fact total line, as written
export type FactLine = { kind: "count" | "total"; date: string; fact: string; n: number; line: number };

export type Done = {
  started?: string;
  weeks: Record<string, DoneWeek>;
  // every fact count and fact total line in the order written
  facts: FactLine[];
  // a line this reader does not read, kept exactly as written so it is never lost
  others: string[];
};

// ---- the ledger ----

export type PartName = "graph" | "plan" | "done" | "summary";

// a line read from the ledger: its number in the ledger and its text
export type NumberedLine = { line: number; text: string };

// a line in a part that is not read, with why
export type LineProblem = { part: PartName | "before the parts"; line: number; text: string };

// a line with a spec 1 word marked new or to settle that this reader does not read yet
export type NotReadYet = LineProblem & { word: string };

export type Ledger = {
  spec?: number;
  graph?: Graph;
  plan?: Plan;
  done?: Done;
  summary?: string[];
  unreadable: LineProblem[];
  notReadYet: NotReadYet[];
};
