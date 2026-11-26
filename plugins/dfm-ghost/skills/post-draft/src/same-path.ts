// Says whether two paths name the same file, as far as text can tell.
// A report names files as they were given to quotes-check, often from another folder:
// "drafts/iced-coffee.txt" and "/home/sam/dfm/drafts/iced-coffee.txt" are the same file.

export function samePath(first: string, second: string): boolean {
  const a = withoutDotSlash(first);
  const b = withoutDotSlash(second);
  if (a === b) {
    return true;
  }
  return a.endsWith(`/${b}`) || b.endsWith(`/${a}`);
}

function withoutDotSlash(path: string): string {
  let tidy = path.trim();
  while (tidy.startsWith("./")) {
    tidy = tidy.slice(2);
  }
  return tidy;
}
