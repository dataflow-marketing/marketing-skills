// A post's summary in a said line is its own first sentence, word for word: never written for it.
// The page text starts with the site's name and the post's title as the page shows them: those are skipped.

export function firstSentence(text: string, skip: readonly string[]): string {
  const lines = text.split("\n").map((line) => line.trim()).filter((line) => line !== "");
  const words = lines.filter((line) => !skip.includes(line) && !/^\d{4}-\d{2}-\d{2}$/.test(line));
  const body = words.join(" ");
  const sentence = /^(.+?[.!?])(?:\s|$)/.exec(body);
  return sentence ? sentence[1] : body;
}
