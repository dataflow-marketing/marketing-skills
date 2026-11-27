---
name: weeks-archive
description: Keep a ledger under its store's size limit by moving the done lines of old weeks, whole, into the business's history, with a script. Past 75% of the limit it keeps the last 26 weeks; nothing is lost. Use when a ledger is getting big ("the field is nearly full", plan-check or week-run says a ledger is past 75%) and as the last step of dfm-recipes:week-run when it is.
---

# weeks-archive

A scripted write. The script works out what moves, writes both files and reads them back; Claude runs it, shows what it printed and asks for a yes.

## What it does

- **Nothing while the ledger is at or under 75%** of its store's limit (65,535 bytes for a Ghost member field).
- **Past it,** the done lines of every week before the last 26 move, whole, to the end of the history's done part. A line already in the history is not added twice. Lines that are not dated (`started 2026-07-01`) stay. The graph, the plan and the summary stay.
- The history is a ledger with only a done part: it reads like any other ledger. Nothing is lost.

## Run

From the working folder, on copies of the ledger and its history (`dfm-store:object-read --out`, for each):

```
node <this skill's folder>/dist/run.js --ledger ledger.txt --history history.txt --settings settings.txt
```

1. **Preview** (the default): says the ledger's size and what would move. Nothing is written.
2. **Ask for a yes.**
3. **Go:** the same command with `--go`. It writes the history first, then the ledger, then reads both back.
4. In a store, write both back with `dfm-store:object-change` (or `object-add` for a history that is not there yet): the history first, then the ledger.

`--keep <weeks>`, `--limit <bytes>` and `--at <percent>` change the rules; the usual ones fit a Ghost member field.

| Exit code | Means |
|---|---|
| 0 | done (or nothing to move) |
| 1 | read back: a moved line is not where it should be |
| 2 | refused or failed: settings with problems, a ledger that cannot be read |

## Settings

The history is its own object, bound like the ledger: `binding history <business>: members <email> history` for a Ghost member field named `history`.

## Asking

- **Ask with the question dialog** where there is one: every question and every yes, with options such as "Yes, go on", "Change something" and "Stop". Where there is no dialog, the question is the last line of the message. A question in the middle of a long message is easily missed.
- **Its script needs Node 24 or later.** If `node` is not found, ask the person how Node is installed and run the script with that Node.

## Next

`dfm-ledger:summary-make` writes the summary again: it now reads only the weeks kept.
