// Gives the slug for the post when the words file's link is on this site:
// https://coffee-shop.example/iced-coffee/ gives iced-coffee.
// A link elsewhere or with no slug in it gives nothing: Ghost then makes the slug from the title.

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function slugFromLink(link: string | undefined, address: string): string | undefined {
  if (!link || !link.startsWith(`${address}/`)) {
    return undefined;
  }

  const rest = link.slice(address.length);
  const parts = rest.split("/").filter((part) => part !== "");
  const last = parts[parts.length - 1];
  if (!last || !SLUG.test(last)) {
    return undefined;
  }
  return last;
}
