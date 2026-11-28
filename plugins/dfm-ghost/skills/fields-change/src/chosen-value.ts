// The value to send for a field, from what was asked for, checked against the field as Ghost defines it:
//   a pick list takes only its own choices, word for word: it is sent as a list ("a | b" where more than one may be picked)
//   any other field takes text; nothing (an empty value) clears it

import type { FieldDefinition, FieldValue } from "@dataflow-marketing/store";

export type Chosen = { ok: true; value: FieldValue } | { ok: false; problem: string };

export function chosenValue(field: FieldDefinition, written: string): Chosen {
  const text = written.trim();
  if (text === "") {
    return { ok: true, value: null };
  }
  if (field.type !== "list") {
    return { ok: true, value: text };
  }
  const picked = field.multiple ? text.split("|").map((each) => each.trim()).filter((each) => each !== "") : [text];
  const options = field.options ?? [];
  for (const choice of picked) {
    if (!options.includes(choice)) {
      return { ok: false, problem: `"${choice}" is not a choice for ${field.key}. Its choices, word for word: ${options.join(" / ") || "none"}.` };
    }
  }
  return { ok: true, value: picked };
}
