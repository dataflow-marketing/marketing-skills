// Adds up one site's rows: visits, views and outside (views whose referer is another site, "found the site").
// Cloudflare samples some answers; a row with a sample interval above 1 makes the numbers estimates.

import { bareHost } from "./facts-to-read.ts";
import type { Measure } from "./facts-to-read.ts";
import type { Row } from "./ask-cloudflare.ts";

export type Numbers = Record<Measure, number> & { estimated: boolean };

export function addUp(host: string, rows: readonly Row[]): Numbers {
  const numbers: Numbers = { visits: 0, views: 0, outside: 0, estimated: false };

  for (const row of rows) {
    numbers.visits += row.visits;
    numbers.views += row.views;
    if (cameFromOutside(host, row.refererHost)) {
      numbers.outside += row.views;
    }
    if (row.sampleInterval > 1) {
      numbers.estimated = true;
    }
  }

  return numbers;
}

function cameFromOutside(host: string, refererHost: string): boolean {
  return refererHost !== "" && bareHost(refererHost) !== host;
}
