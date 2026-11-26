// Turns the line grammar into the parser the reader uses: one ES module, web standard JavaScript.
// Used by the build and by the test that the committed parser is current.

import peggy from "peggy";

const START_RULES = ["GraphLine", "PlanLine"];
const BANNER = "// Built by pnpm build from grammar/lines.peggy. Do not edit: change the grammar and build again.\n";

export function generateLines(grammar: string): string {
  const parser = peggy.generate(grammar, {
    output: "source",
    format: "es",
    allowedStartRules: START_RULES,
  });
  return BANNER + parser;
}
