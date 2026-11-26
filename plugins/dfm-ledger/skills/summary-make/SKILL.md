---
name: summary-make
description: Write a ledger's summary from its graph, plan and done lines, with a script, never by hand. Use after a ledger changes ("update the summary", "what does my week look like") and as a step of dfm-recipes:week-run.
---

# summary-make

A scripted write to the ledger. The script works out every line; Claude runs it, shows what it printed and asks for a yes. Nothing in the summary is written by Claude.

## What it writes

Each line ends with where it came from (calculated, modelled) and whether it is a want, an expectation or something that happened ([ledger](../../spec/ledger.md), Summary):

- the goal (want)
- each fact's weekly numbers and their average, the goal's fact first; totals on their day (happened)
- this week so far; this week's steps done and not done yet (happened)
- links with a known rate (proven or believed)
- the forecast for a weekly goal with a date: a straight line through the counted weeks, rough until 8 are counted (expect)
- who this week's content was for; more clicks than opens where a link scanner is likely
- the facts never counted: unknown is not zero

## Run

From the working folder:

```
node <this skill's folder>/dist/run.js --ledger ledger.txt --settings settings.txt --preview
```

1. **Preview** (the default): shows the summary it would write and writes nothing. Show it in full.
2. **Ask for a yes.**
3. **Go:** the same command with `--go`. It replaces the summary part (every line above it is kept as it was), writes a run log line and reads it back.
4. **Read back** at any time with `--read-back`: it says whether the summary is still what the lines above it say.

Today is today in the settings' time zone; `--today <date>` writes a summary as of another day.

| Exit code | Means |
|---|---|
| 0 | done; or the summary is current |
| 1 | read back: the summary is not current |
| 2 | refused or failed: settings with problems, a ledger with lines that cannot be read (run `dfm-ledger:plan-check`), a file that cannot be read |

## Asking

- **Ask with the question dialog** where there is one: every question and every yes, with options such as "Yes, go on", "Change something" and "Stop". Where there is no dialog, the question is the last line of the message. A question in the middle of a long message is easily missed.
- **Ask for what is missing; never guess it.** When an answer could mean more than one thing, ask which.
- **Its script needs Node 24 or later.** If `node` is not found, ask the person how Node is installed and run the script with that Node.

## Next

In `dfm-recipes:week-run`, go back to the recipe. On its own, the ledger with its summary is ready for `dfm-ledger:askai-make`: a copy for any AI chat.
