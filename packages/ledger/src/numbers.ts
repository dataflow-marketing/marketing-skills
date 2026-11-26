// How a ledger writes numbers: whole numbers with thousands (1,240), others to one place (7.5).

export function written(n: number): string {
  const rounded = Math.round(n * 10) / 10;
  return rounded.toLocaleString("en-AU", { maximumFractionDigits: 1 });
}
