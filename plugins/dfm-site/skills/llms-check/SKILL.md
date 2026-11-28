---
name: llms-check
description: Check whether a site's /llms.txt is on and what it holds (its title, summary, sections and links); whether its /llms-full.txt has every page and post for an AI to read, with a script that only reads. Use when someone asks whether AI tools can read their site ("is my llms.txt on", "can ChatGPT read my site") or as a step of dfm-recipes:health-run.
---

# llms-check

A scripted check. The script reads the site's `/llms.txt` and `/llms-full.txt` and prints what they hold; Claude runs it and shows it. It never writes to the site.

## Run

```
node <this skill's folder>/dist/run.js --address <https://...>
```

The address is the site's: `https://`; `http://localhost` for a site on this computer. Settings name it for a site added with a `site-add`.

| Exit code | Means |
|---|---|
| 0 | both files are on |
| 1 | one or both are not on |
| 2 | refused or failed: not an address, not https |

## What it says

- **/llms.txt:** on or not; its `# ` title and `> ` summary (what the site is, in a line); its `## ` sections; how many links. A missing title or summary is said.
- **/llms-full.txt:** on or not; how many pages and posts it holds; how many words. `dfm-content:profile-make` reads it.
- **A page answering every address** (some sites answer a missing file with a page that says 200) is not the file: it says so.

## Show the person

Show what it printed, in full. When a file is not on, say where it can be turned on only when the site's builder is known: on Ghost it is on unless the site is private or the setting is off. Never say how to turn it on for a builder you do not know.

## Asking

- **Ask with the question dialog** where there is one. Where there is no dialog, the question is the last line of the message.
- **Its script needs Node 24 or later.** If `node` is not found, ask the person how Node is installed and run the script with that Node.
