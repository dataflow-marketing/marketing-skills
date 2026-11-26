// The ledger shapes carry forward reads. Only the parts it needs:
// a fuller entry or done record (with more fields) can be passed as it is.

// one dated plan line: "=" planned, "+" added that week, "-" taken off that week
export type Entry = {
  date: string;
  op: "=" | "+" | "-";
  methods: { name: string }[];
};

export type Answer = "done" | "not done";

// the done lines, each week keyed by its Monday
export type Done = {
  weeks: Record<string, { answers: Record<string, Answer> }>;
};
