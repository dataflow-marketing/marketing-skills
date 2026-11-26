// The shape the parser gives back for each graph or plan line (grammar/lines.peggy).

import type { Frequency, GroupRule, Label, Part, Result } from "./ledger-shape.ts";

export type GraphLineShape =
  | { kind: "spec"; version: number }
  | { kind: "blank" }
  | { kind: "extends"; file: string }
  | { kind: "fact"; fact: string; source: string }
  | { kind: "group"; name: string; rule: GroupRule }
  | { kind: "area"; name: string; members: string[] }
  | { kind: "icon"; icon: string; members: string[] }
  | { kind: "cycle"; frequency: Frequency }
  | { kind: "remove"; from: Part[]; to: string }
  | { kind: "when"; when: string; event: string }
  | { kind: "link"; from: Part[]; to: string; result: Result; within: number | "?"; label?: Label; downside: boolean };

export type PlanLineShape =
  | { kind: "spec"; version: number }
  | { kind: "blank" }
  | { kind: "extends"; file: string }
  | { kind: "start"; date: string }
  | { kind: "want"; fact: string; n?: number; by?: string; per?: { n: number; every: "week" | "month" }; grows?: true }
  | { kind: "every"; every: "week"; methods: Part[]; from?: string }
  | { kind: "how" | "script"; thing: string; words: string; week?: string }
  | { kind: "entry"; date: string; op: "=" | "+" | "-"; methods: Part[] };
