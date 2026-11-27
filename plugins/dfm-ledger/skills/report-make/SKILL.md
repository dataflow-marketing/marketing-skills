---
name: report-make
description: Write a short report on a business's marketing for a period (a month, a quarter, the weeks from one date to another) from its ledger, in the same layout every time, every number taken from the ledger's summary or its done lines and checked with dfm-content:quotes-check. It reports and never advises. Use when someone wants to see how a period went ("how did November go", "a report for the last month", "what happened this quarter").
---

# report-make

A words skill. Claude writes the report **only from the ledger**: its summary (written by `dfm-ledger:summary-make`) and its done lines. `dfm-content:quotes-check` proves every number, name and quote in it. It says what happened, never why and never what to do: that is `dfm-ledger:askai-make`.

## What it reads

1. **The ledger,** with a summary written today: run `dfm-ledger:summary-make` first. For a ledger in a store, copy it out with `dfm-store:object-read`.
2. **The period:** ask for it, as two Mondays (from, to) or a month. Only the done weeks inside it are reported.
3. **The last report,** when there is one: its layout: a period can then be read beside the one before.

It writes `reports/<business>-<period>.md`, never over a report already there.

## The layout

```
# <the business>: <the period>

<one line: from which ledger, the weeks it covers>

## The numbers

<one line a counted fact: each week's number in the period, as the done lines have them; the summary's average>

## What was done

<each step in the plan, then the weeks of the period it was ticked, as the done lines have them>

## What went out

<each said line in the period: its day, its channel, its title>

## Not known yet

<the summary's not counted lines: unknown is not zero>

## Next

<the plan's steps for the week after the period, as the plan has them>
```

- **The same headings every time,** in this order. A part with nothing in it says so in one line.
- **For a ledger read from outside** (it has `read on` lines), the summary's outside lines go under the numbers: how often each step was done, what changed, offers ended, claims with no proof.

## Writing

- **Every number from the ledger,** as it is written there. Never add up, average or compare numbers yourself: a number the summary does not give is left out. A count of ticks is not given: list the weeks instead.
- **Their words stay theirs:** a step, a fact or a said line's title as the ledger names it.
- **Never a cause, never advice.** What happened, never why, never what to do next beyond the plan's own next steps.
- **Plain, short sentences.** Read the house rules in the person's settings.

## Check it

```
node <quotes-check folder>/dist/run.js --text reports/<business>-<period>.md --against <the ledger> > reports/<business>-<period>.check.txt
```

Remove what was not found, never reword it. Run the check again until it says `result: passed`. Show the report in full and the passing report. The person reads every word: the check cannot catch a claim with no number or name in it.

## Asking

- **Ask with the question dialog** where there is one: every question and every yes. Where there is no dialog, the question is the last line of the message.
- **Ask for what is missing; never guess it.** When an answer could mean more than one thing, ask which.

## Next

To talk the period through with an AI chat and settle what to change: `dfm-ledger:askai-make`.
