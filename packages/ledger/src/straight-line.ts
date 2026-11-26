// The least squares line: the straight line that sits closest to every point at once.
// It gives the slope and a way to read the line at any x.

import { averageOf } from "./average.ts";

export type StraightLine = {
  slope: number;
  at: (x: number) => number;
};

export function straightLine(xs: number[], ys: number[]): StraightLine {
  const meanX = averageOf(xs);
  const meanY = averageOf(ys);

  let across = 0;
  let spread = 0;
  for (let i = 0; i < xs.length; i++) {
    across += (xs[i] - meanX) * (ys[i] - meanY);
    spread += (xs[i] - meanX) ** 2;
  }

  let slope = 0;
  if (spread) {
    slope = across / spread;
  }

  return {
    slope,
    at: (x) => meanY + slope * (x - meanX),
  };
}
