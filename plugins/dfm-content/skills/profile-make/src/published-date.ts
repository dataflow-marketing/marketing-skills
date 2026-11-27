// The day a page says it was published, when it says so: from its article:published_time (how Ghost, WordPress and
// most blogs mark a post) or else from the first <time datetime="...">. A page with a published day is a post.

const ARTICLE_TIME = /<meta[^>]+property=["']article:published_time["'][^>]+content=["']([^"']+)["']/i;
const ARTICLE_TIME_FIRST = /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']article:published_time["']/i;
const TIME_ELEMENT = /<time[^>]+datetime=["']([^"']+)["']/i;
const DAY = /^(\d{4}-\d{2}-\d{2})/;

export function publishedDate(html: string): string | undefined {
  const found = ARTICLE_TIME.exec(html)?.[1] ?? ARTICLE_TIME_FIRST.exec(html)?.[1] ?? TIME_ELEMENT.exec(html)?.[1];
  return found === undefined ? undefined : DAY.exec(found)?.[1];
}
