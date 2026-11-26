// Reads the graph part: how the business works (spec/ledger.md, Graph).
// Each line is read on its own with the grammar. A line it cannot read is given back as unread.

import type { Graph, NumberedLine } from "./ledger-shape.ts";
import type { GraphLineShape } from "./line-shapes.ts";
import { parseGraphLine } from "./parse-line.ts";
import { toldForPaste } from "./told-for-paste.ts";

export type GraphReading = { graph: Graph; unread: NumberedLine[] };

export function readGraph(lines: NumberedLine[]): GraphReading {
  const graph = emptyGraph();
  const unread: NumberedLine[] = [];

  for (const numbered of lines) {
    const shape = parseGraphLine(numbered.text);
    if (shape === undefined) {
      unread.push(numbered);
      continue;
    }
    addToGraph(graph, shape, numbered.line);
  }

  return { graph, unread };
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
