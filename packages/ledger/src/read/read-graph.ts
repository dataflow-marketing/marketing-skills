// Reads the graph part: how the business works (spec/ledger.md, Graph).
// Each line is read on its own with the grammar. A line it cannot read is given back as unread.

import type { Graph, NumberedLine } from "./ledger-shape.ts";
import type { GraphLineShape } from "./line-shapes.ts";
import { parseGraphLine } from "./parse-line.ts";
import { readThing } from "./read-thing.ts";
import { splitSource } from "./source-word.ts";
import { toldForPaste } from "./told-for-paste.ts";

export type GraphReading = { graph: Graph; unread: NumberedLine[] };

export function readGraph(lines: NumberedLine[]): GraphReading {
  const graph = emptyGraph();
  const unread: NumberedLine[] = [];

  for (const numbered of lines) {
    const read = readOneLine(graph, numbered);
    if (!read) {
      unread.push(numbered);
    }
  }

  return { graph, unread };
}

// a fact line keeps its source in its own words, as it always has; any other line has its source word taken off
// the end first; a line the grammar does not read may be a thing a business is or shows
function readOneLine(graph: Graph, numbered: NumberedLine): boolean {
  const whole = parseGraphLine(numbered.text);
  if (whole !== undefined && (whole.kind === "fact" || !splitSource(numbered.text).written)) {
    addToGraph(graph, whole, numbered.line);
    return true;
  }
  const { text, source } = splitSource(numbered.text);
  const shape = parseGraphLine(text);
  if (shape !== undefined) {
    addToGraph(graph, shape, numbered.line);
    return true;
  }
  const thing = readThing(text, source, numbered.line);
  if (thing !== undefined) {
    graph.things = [...(graph.things ?? []), thing];
    return true;
  }
  return false;
}

function emptyGraph(): Graph {
  return { facts: [], groups: [], links: [], whens: [], removes: [], areas: [], icons: [] };
}

function addToGraph(graph: Graph, shape: GraphLineShape, line: number): void {
  switch (shape.kind) {
    case "extends":
      graph.extends = shape.file;
      return;
    case "fact":
      graph.facts.push({ fact: shape.fact, source: toldForPaste(shape.source), line });
      return;
    case "cycle":
      graph.cycle = shape.frequency;
      return;
    case "group":
      graph.groups.push({ name: shape.name, rule: shape.rule, line });
      return;
    case "area":
      graph.areas.push({ name: shape.name, members: shape.members, line });
      return;
    case "icon":
      graph.icons.push({ icon: shape.icon, members: shape.members, line });
      return;
    case "remove":
      graph.removes.push({ from: shape.from, to: shape.to, line });
      return;
    case "when":
      graph.whens.push({ when: shape.when, event: shape.event, line });
      return;
    case "link":
      graph.links.push(linkOf(shape, line));
      return;
    default:
      // a spec line or a blank line: nothing to keep
      return;
  }
}

function linkOf(shape: Extract<GraphLineShape, { kind: "link" }>, line: number): Graph["links"][number] {
  const link: Graph["links"][number] = {
    from: shape.from,
    to: shape.to,
    result: shape.result,
    within: shape.within,
    downside: shape.downside,
    line,
  };
  if (shape.label) {
    link.label = shape.label;
  }
  return link;
}
