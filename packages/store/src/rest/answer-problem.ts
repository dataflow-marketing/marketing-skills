// What an answer from a rest store that is not a success means, in one line a person can act on.
// Only the status is used: a store's own message could hold anything. None is printed.

const MEANINGS: Record<number, string> = {
  400: "refused the request as malformed (400). Check the object's kind and id: the id is the business's name.",
  401: "refused the key (401). Check the key named in settings is the store's key.",
  403: "refused the key (403). Check the key named in settings is the store's key.",
  413: "refused the body as larger than it takes (413).",
  428: "asked for the version the change was read at (428).",
};

export function answerProblem(address: string, doing: string, status: number): string {
  const meaning = MEANINGS[status] ?? `answered ${status}.`;
  return `The store at ${address} ${meaning} It was asked to ${doing}.`;
}
