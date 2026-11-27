// The posts in a read, from profile-make's pages file: each "### <title>" under "## Posts", its "URL: " line
// and its "Published: " line. A post that does not say when it was published has no day: it is counted, not said.

export type Post = {
  day?: string;
  title: string;
  url: string;
  text: string;
};

const PUBLISHED = /^Published: (\d{4}-\d{2}-\d{2})$/;

export function readPosts(pagesText: string): Post[] {
  const lines = pagesText.split(/\r?\n/);
  const posts: Post[] = [];
  let inPosts = false;
  let current: Post | undefined;

  lines.forEach((line, index) => {
    if (line.trim() === "## Posts" || line.trim() === "## Pages") {
      inPosts = line.trim() === "## Posts";
      current = undefined;
      return;
    }
    const startsItem = line.startsWith("### ") && (lines[index + 1] ?? "").startsWith("URL: ");
    if (startsItem) {
      current = inPosts ? { title: line.slice(4).trim(), url: lines[index + 1].slice(5).trim(), text: "" } : undefined;
      if (current) {
        posts.push(current);
      }
      return;
    }
    if (current === undefined || line.startsWith("URL: ")) {
      return;
    }
    const published = PUBLISHED.exec(line);
    if (published) {
      current.day = published[1];
      return;
    }
    current.text += `${line}\n`;
  });

  return posts;
}
