// One problem plan-check found; also the lines it sets aside without counting them as problems.

export type ProblemKind =
  | "unreadable line"
  | "fact not declared"
  | "step with no link"
  | "count and total in one week"
  | "settings";

export type Problem = {
  kind: ProblemKind;
  // what the problem is about: the line's text, a fact, a step or a settings line
  about: string;
  // the ledger lines it is on, first line first; none for a settings problem
  lines: number[];
};

// a line with a spec 1 word this reader does not read yet: named, never a problem
export type SetAside = { word: string; line: number };

export type CheckResult = {
  problems: Problem[];
  setAside: SetAside[];
  // false when bad settings stopped the check before the ledger was read
  ledgerChecked: boolean;
};
