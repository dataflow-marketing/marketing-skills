// The shapes passed between post-draft's modules.

// A words file once it is read: the fields post-draft uses and the body's paragraphs.
// The other fields in spec/words.md (topic, for, ask, campaign) are read and not sent to Ghost.
export type Words = {
  kind: string;
  state: string;
  title?: string;
  excerpt?: string;
  channel: string;
  link?: string;
  from: string;
  tags: string[];
  paragraphs: string[];
};

// What post-draft would send: exactly these bytes, plus the Authorization header at send time.
export type DraftRequest = {
  method: "POST";
  url: string;
  headers: Record<string, string>;
  body: string;
};

// What post-draft reads back from Ghost about a post.
export type GhostPost = {
  id: string;
  status: string;
  title: string;
  slug: string;
};

export type GhostPostResult = { ok: true; post: GhostPost } | { ok: false; problem: string };

// The title and slug the post on Ghost must have. The slug is unknown
// until Ghost makes it when the words file's link does not name one.
export type ExpectedPost = {
  title: string;
  slug?: string;
};

// fetch, passed in as a value: the real one in Node or a Worker, a fake Ghost in tests.
export type Fetch = (url: string, init: RequestInit) => Promise<Response>;
