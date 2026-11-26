// The lines a change line takes the place of: a step has one how and one set of script lines, a business one
// goal and one start, a fact one source and a link one rate. Each is given as the beginning of the lines it
// replaces. Any other line is added beside what is there.

const ARROWS = ["->", "\u2192"];

export function replaces(line: string): string[] {
  const how = /^(how|ask) ([^:]+):/.exec(line);
  if (how) {
    return [`${how[1]} ${how[2]}:`];
  }
  if (/^want /.test(line)) {
    return ["want "];
  }
  if (/^start \d{4}-\d{2}-\d{2}$/.test(line)) {
    return ["start "];
  }
  const fact = /^fact ([^:]+):/.exec(line);
  if (fact) {
    return [`fact ${fact[1]}:`];
  }
  const link = /^(.+?) (?:->|\u2192) ([^:]+):/.exec(line);
  if (link) {
    return ARROWS.map((arrow) => `${link[1]} ${arrow} ${link[2]}:`);
  }
  return [];
}

// script lines replace a step's earlier script lines as a set: the step whose lines these are
export function scriptStep(line: string): string | undefined {
  return /^script ([^:]+):/.exec(line)?.[1];
}
