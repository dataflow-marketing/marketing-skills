---
name: counts-record
description: Add the numbers a person tells for a week (counts and totals) and their ticks to a ledger's done part, with a script. Use when someone says how their week went ("we had 560 visits this week", "I did the new post", "the list is at 312") and as a step of dfm-recipes:week-run.
---

# counts-record

A scripted write to the ledger. The script checks and writes the done lines; Claude asks the person for the numbers, runs it, shows what it printed and asks for a yes. Every number comes from the person: told, never guessed.

## What to ask the person

1. **The week,** if it is not this one: its Monday, such as `2026-11-30`.
2. **This week's count of each fact the graph declares** (`fact <name>: told`), such as `visits`. A number they do not know is left out: unknown is not zero.
3. **A total on a day,** such as the size of a list, if they have one.
4. **Which of the week's steps are done,** and any they say are not done.

Ask in the question dialog where there is one. Read the graph's facts and the week's steps from the ledger first: each question then names them.

## Run

From the working folder:

```
node <this skill's folder>/dist/run.js --ledger ledger.txt --settings settings.txt [--week <Monday>] --count "visits=560" --count "cups served=640" --done "new post" --preview
```

`--count`, `--total`, `--done` and `--not-done` can each be given more than once.

1. **Preview** (the default): shows the lines it would add and writes nothing. Show them in full.
2. **Ask for a yes.**
3. **Go:** the same command with `--go`. It writes the lines (a count replaces that week's earlier count of the fact), writes a run log line and reads them back.

This week's counts are so far: it adds `counted to <today>`. A week gone by is whole and loses its `counted to`.

| Exit code | Means |
|---|---|
| 0 | done |
| 1 | read back: a line is not there |
| 2 | refused or failed: a fact the graph does not declare, a step not in that week, a week not begun, settings with problems, a ledger with lines that cannot be read, nothing told |

## Asking

- **Ask with the question dialog** where there is one: every question and every yes, with options such as "Yes, go on", "Change something" and "Stop". Where there is no dialog, the question is the last line of the message. A question in the middle of a long message is easily missed.
- **Ask for what is missing; never guess it.** When an answer could mean more than one thing, ask which.
- **Its script needs Node 24 or later.** If `node` is not found, ask the person how Node is installed and run the script with that Node.

## Next

The summary is now out of date: `dfm-ledger:summary-make` writes it again. In `dfm-recipes:week-run`, that is the recipe's next step.
