---
name: links-check
description: Find the links on a site that do not work for a visitor: the home page and the pages its sitemap lists (up to 50) are read, every link on them is checked once, one at a time with a pause; each that does not work is named with the pages it is on. A script that only reads. Use when someone asks about broken links ("are there broken links on my site", "check my links") or as a step of dfm-recipes:health-run.
---

# links-check

A scripted check. The script reads the pages and asks each link once; Claude runs it and shows it. It never writes to the site.

## Run

```
node <this skill's folder>/dist/run.js --address <https://...> [--max-pages <n>]
```

| Exit code | Means |
|---|---|
| 0 | every link checked works |
| 1 | some links do not work |
| 2 | refused or failed: not an address, not https |

## How it asks

- **The pages:** the home page, then the pages and posts the sitemap lists, up to 50 (`--max-pages` for more or fewer).
- **The links:** every `<a href>` on them, on the site or off it, each checked once however many pages it is on. Not checked: `mailto:`, `tel:`, a jump within a page.
- **Politely:** one request at a time, a quarter of a second apart, at most 300 links. What is over a limit is said, never dropped quietly.
- **Works** means the link ends in an answer below 400, redirects followed. A site that does not answer a light `HEAD` request is asked again with `GET`.

## Show the person

Show what it printed, in full: each link that does not work, why (the answer it gave; that it could not be reached) and the pages it is on. A link to another site that does not answer may be that site's problem, not theirs: say so. Fixing a link is the person's job on their own site; no skill changes a page.

## Asking

- **Ask with the question dialog** where there is one. Where there is no dialog, the question is the last line of the message.
- **Its script needs Node 24 or later.** If `node` is not found, ask the person how Node is installed and run the script with that Node.
