// What the person told: "visits=560" or "loyalty list=312". A name, an equals sign and a whole number, with or
// without thousands (1,240).

export type Told = { name: string; n: number };

export type ToldResult = { ok: true; told: Told } | { ok: false; problem: string };

const TOLD = /^(.+?)\s*=\s*(\d{1,3}(?:,\d{3})*|\d+)$/;

export function readTold(text: string): ToldResult {
  const match = TOLD.exec(text.trim());
  if (!match) {
    return { ok: false, problem: `Not a number told: ${text}. Write it as name=number, such as visits=560.` };
  }
  return { ok: true, told: { name: match[1].trim(), n: Number(match[2].replace(/,/g, "")) } };
}
