// Which pages changed since the site was last read: only those need reading again (27 Nov 2026).
//   fingerprints.txt   one line a page: a short hash of its title and text, then its address
//   changed.txt        the new and changed pages in full, then the addresses of the pages gone
// Pure: web standard crypto only.

import { itemText } from "./pages-text.ts";
import type { SiteItem } from "./read-llms-full.ts";

export type Changes = { added: SiteItem[]; changed: SiteItem[]; removed: string[]; same: number };

export async function fingerprints(items: readonly SiteItem[]): Promise<string> {
  const lines = await Promise.all(items.map(async (item) => `${await hashOf(`${item.title}\n${item.text}`)} ${item.url}`));
  return `${lines.join("\n")}\n`;
}

export async function changesSince(before: string, items: readonly SiteItem[]): Promise<Changes> {
  const was = new Map(before.split("\n").filter((line) => line.includes(" ")).map((line) => [line.slice(line.indexOf(" ") + 1), line.slice(0, line.indexOf(" "))]));
  const now = new Set(items.map((item) => item.url));
  const changes: Changes = { added: [], changed: [], removed: [...was.keys()].filter((url) => !now.has(url)), same: 0 };

  for (const item of items) {
    const before = was.get(item.url);
    if (before === undefined) {
      changes.added.push(item);
    } else if (before !== (await hashOf(`${item.title}\n${item.text}`))) {
      changes.changed.push(item);
    } else {
      changes.same += 1;
    }
  }
  return changes;
}

export function changedText(changes: Changes): string {
  const sections: string[] = [];
  if (changes.added.length > 0) {
    sections.push("## New", ...changes.added.map(itemText));
  }
  if (changes.changed.length > 0) {
    sections.push("## Changed", ...changes.changed.map(itemText));
  }
  if (changes.removed.length > 0) {
    sections.push("## Gone", ...changes.removed.map((url) => `URL: ${url}`));
  }
  if (sections.length === 0) {
    sections.push("Nothing changed.");
  }
  return `${sections.join("\n")}\n`;
}

async function hashOf(text: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest).slice(0, 8), (byte) => byte.toString(16).padStart(2, "0")).join("");
}
