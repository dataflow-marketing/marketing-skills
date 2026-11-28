---
name: report-run
description: Make a business's report for a period (a month, a quarter, the weeks from one date to another): a fresh summary of its ledger with summary-make, then the report with report-make, checked, in the same layout every time. Use when someone wants to see how a period went ("how did November go", "the report for this month", "a report for every business").
---

# report-run

A recipe. It does no work of its own: it runs the skills below in order. After each step, show what it did and **wait for a yes** before the next. A no stops the run where it is; nothing later runs.

It needs `dfm-ledger` and `dfm-content` (for quotes-check) installed, a ledger and settings.

## The steps

1. **The period.** Ask for it: two Mondays or a month. Show the weeks it covers. **Yes?**

2. **`dfm-ledger:summary-make`.** A summary written today. For a ledger in a store, copy it out first (`dfm-store:object-read --out runs/<today>/<business>/ledger.txt`) and make the report from the copy: a report changes no ledger. **Yes?**

3. **`dfm-ledger:report-make`.** The report for the period, checked with quotes-check. Show it in full with its passing check. **Yes?**

4. **Offer `dfm-ledger:askai-make`,** to talk the period through with an AI chat. Only when the person wants it.

## Every business in settings

When the person asks for every business: run steps 2 and 3 for each business with a ledger bound in settings, one after another, then show every report together. One yes takes them all; any can be changed or left out.

## When a step fails

Stop. Show what the step printed. Fix what it names and run that step again: never skip a step or run a later one around it.

## Asking

- **Ask with the question dialog** where there is one: every question and every yes, with options such as "Yes, go on", "Change something" and "Stop". Where there is no dialog, the question is the last line of the message. A question in the middle of a long message is easily missed.
- **Ask for what is missing; never guess it.** When an answer could mean more than one thing, ask which.
- **Say which step this is** at the start of each message: "Step 3 of 4: report-make". For every business, also say which.
