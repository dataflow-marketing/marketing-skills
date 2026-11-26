// Finds where a needle first stands on its own in a haystack:
// not part of a longer word or number. "sam" is not found in "same".

const LETTER_OR_DIGIT = /[\p{L}\p{N}]/u;

export function findWhole(haystack: string, needle: string): number {
  if (needle === "") {
    return -1;
  }
  let from = 0;
  while (from <= haystack.length) {
    const at = haystack.indexOf(needle, from);
    if (at < 0) {
      return -1;
    }
    if (standsAlone(haystack, needle, at)) {
      return at;
    }
    from = at + 1;
  }
  return -1;
}

function standsAlone(haystack: string, needle: string, at: number): boolean {
  const before = haystack.charAt(at - 1);
  const after = haystack.charAt(at + needle.length);
  const needleStartsWord = LETTER_OR_DIGIT.test(needle.charAt(0));
  const needleEndsWord = LETTER_OR_DIGIT.test(needle.charAt(needle.length - 1));

  if (needleStartsWord && LETTER_OR_DIGIT.test(before)) {
    return false;
  }
  if (needleEndsWord && LETTER_OR_DIGIT.test(after)) {
    return false;
  }
  return true;
}
