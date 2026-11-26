// The copy for any AI chat (spec/ask-ai.md): the instructions (which begin "=== read this first ===") with who and
// where to send filled in, then the
// business's website (its profile), then its plan (the ledger, with a summary written fresh at copy time).
//
//   === read this first ===
//   === their website ===     only when there is a profile
//   === their plan ===
//
// Pure: takes the texts and today, gives back the copy.

import { putSummary } from "@dataflow-marketing/ledger/put-summary";
import { readLedger } from "@dataflow-marketing/ledger/read";
import { writeSummary } from "@dataflow-marketing/ledger/summary";
import { INSTRUCTIONS } from "./instructions.ts";

export type CopyInput = {
  who: string;
  sendTo: string;
  ledgerText: string;
  profileText?: string;
  today: string;
};

export function makeCopy(input: CopyInput): string {
  const parts = [filledIn(input)];
  if (input.profileText !== undefined) {
    parts.push(`=== their website ===\n${profileBody(input.profileText)}\n\n`);
  }
  parts.push(`=== their plan ===\n${freshLedger(input.ledgerText, input.today)}`);
  return parts.join("");
}

function filledIn(input: CopyInput): string {
  return INSTRUCTIONS.replaceAll("{who}", input.who).replaceAll("{send to}", input.sendTo);
}

// the profile under one heading: its own spec line and heading are left out
function profileBody(profileText: string): string {
  const lines = profileText.replace(/\s+$/, "").split("\n");
  const kept = lines.filter((line, index) => !(index < 2 && (line === "spec 1" || line === "=== their website ===")));
  return kept.join("\n");
}

// the ledger with its summary written again from its lines, as of today
function freshLedger(ledgerText: string, today: string): string {
  return putSummary(ledgerText, writeSummary(readLedger(ledgerText), today));
}
