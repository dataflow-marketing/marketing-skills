---
name: market-read
description: Keep a business's market ledger, its site read the way the public sees it, read after read: code writes each read, its counts, its posts, the ticks and the summary; Claude writes what stands on the site and what changed; quotes-check proves it. Also puts a business's ledger beside its own market ledger to show what it does that its site never says. Use for a neighbour in a market or for the business itself ("read the competitors into ledgers", "how does my site look from outside", "what does my site not say").
---

# market-read

A scripted read with a words part. The shape is [the market ledger](../../spec/market.md): the ledger's four parts, read from outside. The script writes what code can be sure of. Claude writes the rest, only from the site's own words.

## 1. Read the site

`dfm-content:profile-make`'s script first, into a new folder for this read (with `--since` the last read's folder, when there is one). Its pages file keeps each post's published day.

## 2. Add the read

From the market folder:

```
node <this skill's folder>/dist/run.js --read <the read's folder> --day <the read's day> --out <new ledger file> --ledger <last ledger file> --dates <dates file>
```

For a first read, `--business <name> --site <address>` in place of `--ledger`; add `--own` for the business's own site. It writes a new file, never over one: the read line and its counts keyed by the read's Monday, a said line for each new post keyed by its own Monday, then the ticks and the summary. The dates file lists each Monday with the day it is for.

| Exit code | Means |
|---|---|
| 0 | done |
| 2 | refused or failed: the out file is already there, a folder with no pages or counts, a command not understood |

## 3. Write what stands and what changed

In the new file, only from the read's pages (all of them on a first read, `changed.txt` after):

- **The graph:** what the business is, in a line; then `opens`, `offer`, `claim`, `proof`, `answers`, `channel`, each with their words in quotes, its page in brackets and `(observed)` or `(inferred)`. A claim ends `proof on the site` or `no proof on the site`, never other words. On a business's own market ledger, an offer or channel takes the name it has in the business's ledger.
- **The plan:** only a rhythm its posts show 3 or more times, in the ledger's words, ending `(inferred)` (`every week <step> from <date> (inferred)`; the step's name is in the posts' titles; `a post` is any post). A closure it tells of as `on <date> to <date>: "<their words>" [<page>] (inferred)`. Never a want.
- **What changed,** at the read's Monday, after its counts: `new <word> <name>` for a line first seen, `was <the line as it stood>` for a line changed, `gone <the line>` for one no longer there. A new `on` by its words and page, never by the dates worked out from them.
- **A date worked out from words** (an offer's `until`, an `on`): add a line to the dates file saying which words and which post it came from.

Never write a tick or the summary: code writes them.

## 4. Ticks, summary and check

```
node <this skill's folder>/dist/run.js --summary <ledger file> --dates <dates file>
```

Writes the ticks and the summary again from the plan and the said lines; every other line is kept as written. Then `dfm-content:quotes-check` on the graph and done parts, against every read's pages, home page and counts and the dates file, until it says `result: passed`. Show the summary and the passing report. The person reads every line: the check cannot tell a claim from a proof.

## Inside and outside

With a business's ledger and its own market ledger:

```
node <this skill's folder>/dist/run.js --gaps --ledger <its ledger> --market <its own market ledger>
```

It lists what its ledger has that its site does not say, what its site offers that its ledger does not know, its planned steps beside what its site shows. Say what it printed, never which is right: the business decides.

## Asking

- **Ask with the question dialog** where there is one: every question and every yes. Where there is no dialog, the question is the last line of the message.
- **Ask for what is missing; never guess it.** When an answer could mean more than one thing, ask which.
- **Its script needs Node 24 or later.** If `node` is not found, ask the person how Node is installed and run the script with that Node.
