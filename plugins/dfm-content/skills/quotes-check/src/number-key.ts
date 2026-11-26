// The key a number is matched on: written in figures, with no thousands commas
// and no extra zeros. "1,000" and "1000" match; so do "6.30" and "6.3".
// Something that is not one number, such as "28.11.2026", is matched as written.

const ONE_NUMBER = /^\d+(?:\.\d+)?$/;

export function numberKey(written: string): string {
  const bare = written.replaceAll(",", "");
  if (ONE_NUMBER.test(bare)) {
    return String(Number(bare));
  }
  return bare;
}
