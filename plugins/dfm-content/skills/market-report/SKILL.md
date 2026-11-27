---
name: market-report
description: Write a month's market report for a business, in the same layout every month, from what dfm-content:profile-compare printed (what changed since the last read, the businesses side by side), then check it with dfm-content:quotes-check. Use as the last step of dfm-recipes:market-run. Also when someone asks for this month's market report ("write up the market", "the report for this month").
---

# market-report

A words skill. Claude writes the report **only from what profile-compare printed and the profiles it read**, never from memory or from what a business is likely to have done; `dfm-content:quotes-check` proves it. The same layout every month: a month can be read beside the one before.

## What it reads

From the market folder (see `dfm-recipes:market-run`):

- `<read>/compare.txt`: what changed since the last read, every business
- `<read>/side-by-side.txt`: this read's profiles side by side, the business's own first
- the last read's `report.md`, when there is one: its rows and its three things

It writes `<read>/report.md`. **Never write over a report.** If it is there, ask: the person may have changed it.

## The layout

```
# <the business> and its market: <this read's name>

<one line: who is in it, when they were read, that every line comes from their own sites and was checked word for word>

## Side by side

<one table: a row for each thing the businesses can be told apart by; a column each, the business's own first>

## What changed since <the last read's name>

<one table: a row each for a business that changed, what changed in bold, then a sentence of detail>

The same as last time: <the businesses with no change>.

## What it means for <the business>

1. **<a move, in a few words>.** <why, from the lines above>
2. ...
3. ...

## Next month

<one line: the same read again, only what changed is read>

**<the question to the person>**
```

- **The rows stay the rows.** Keep last month's rows in last month's order. Add a row only when this month shows a difference no row covers. Drop none: a business with nothing for a row says "not said".
- **A cell that changed** ends with *(new)*. A claim that is new and has no proof ends with *(new, no proof)*.
- **Claims and proof are always rows.** A claim is what a business says of itself that a reader cannot check from the page: "award-winning", "the best", "voted". Proof is what lets them check it: an award named, a person named, a number with its source. A claim without its proof is the most useful line in the report: say so plainly, never say it is false.
- **A first read** has no "What changed": it says "The first read: next month shows what moved."
- **Three moves, never more.** Each comes from a line in the tables. Keep last month's moves that still hold, in fewer words; say when one has become more urgent. A move is something the business can do in its own voice on its own site: never copying another's words, never answering another's claim by name.
- **The question** is the person's to choose; on a first read offer "Would you like this for your market?", after that "Would you like this for your market, every month?".

## Writing

- **Their words stay theirs.** A quote in a cell is copied from that business's profile, in quotes.
- **Plain, short sentences.** Numbers and dates as the profiles give them.
- **Never invent a cause.** Say what changed, never why a business changed it.

## Check it

```
node <quotes-check folder>/dist/run.js --text <read>/report.md --against <read>/side-by-side.txt --against <read>/compare.txt --against <the last report.md> --against <own profile> > <read>/report.check.txt
```

Remove what was not found, never reword it. Run the check again until it says `result: passed`. Show the report in full and the passing report. The person reads every word: the check cannot catch a claim with no quote, name or number in it.

## Asking

- **Ask with the question dialog** where there is one: every question and every yes. Where there is no dialog, the question is the last line of the message.
- **Ask for what is missing; never guess it.** When an answer could mean more than one thing, ask which.
- **Its check's script needs Node 24 or later.** If `node` is not found, ask the person how Node is installed and run it with that Node.

## Next

Back to `dfm-recipes:market-run`. On its own, the report is ready to share with the person it is for.
