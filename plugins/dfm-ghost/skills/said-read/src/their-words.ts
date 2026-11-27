// A summary in their own words: the excerpt they wrote; without one, the post's first two sentences. Never written for them.
// 300 characters at most.

// a short form ends with a stop but never ends a sentence; "etc." is not one, it often ends a sentence
const SHORT_FORMS = ["e.g.", "i.e.", "eg.", "ie.", "vs.", "cf."];

export type Words = { custom_excerpt?: string | null; plaintext?: string | null };

export function theirWords(post: Words): string {
  const excerpt = post.custom_excerpt?.trim();
  if (excerpt) {
    return excerpt;
  }
  const text = String(post.plaintext ?? "").replace(/\s+/g, " ").trim();
  const sentences = sentencesOf(text);
  const words = sentences.length >= 2 ? `${sentences[0]} ${sentences[1]}` : text;
  return words.slice(0, 300);
}

// the whole sentences in a text: each ends with . ! or ? followed by a space or the end
function sentencesOf(text: string): string[] {
  const sentences: string[] = [];
  let start = 0;
  for (const end of text.matchAll(/[.!?](?=\s|$)/g)) {
    const upTo = (end.index ?? 0) + 1;
    const sentence = text.slice(start, upTo).trim();
    if (endsWithShortForm(sentence)) {
      continue;
    }
    sentences.push(sentence);
    start = upTo;
  }
  return sentences;
}

function endsWithShortForm(sentence: string): boolean {
  const lastWord = (sentence.split(" ").pop() ?? "").toLowerCase();
  return SHORT_FORMS.includes(lastWord);
}
