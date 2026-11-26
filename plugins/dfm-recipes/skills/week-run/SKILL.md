---
name: week-run
description: Bring in a business's week: the numbers and ticks the person tells, recorded in the ledger, then a fresh summary, running the dfm-ledger skills in order with a yes between each. Use at the end of a week or when someone says how their week went ("let's do this week's numbers", "update my plan for the week").
---

# week-run

A recipe. It does no work of its own: it runs the skills below in order. After each step, show what it did and **wait for a yes** before the next. A no stops the run where it is; nothing later runs.

It needs `dfm-ledger` installed and a ledger (`ledger.txt`, made by `dfm-ledger:plan-make`) with settings beside it.

## The steps

1. **`dfm-ledger:plan-check`.** The ledger must pass before anything is added. If it names problems, stop and show them. **Yes?**

2. **The week's numbers, then `dfm-ledger:counts-record`.**
   - **Read first.** For facts whose source is `cloudflare`, run `dfm-cloudflare:visits-read`; for facts whose source is `ghost`, run `dfm-ghost:numbers-read`; each only when its plugin is installed. Show the numbers read. One yes takes them all; the person may change any of them.
   - **Then ask the person,** one question at a time, only for the rest: the week's count of each other fact the graph declares, a total for any fact counted that way and which of the week's steps are done. A number they do not know is left out: unknown is not zero.
   - Preview every count together with `counts-record`, then write on a yes. **Yes?**

3. **`dfm-ledger:summary-make`.** Preview the new summary, then write it on a yes. Show it in full. **Yes?**

4. **Offer `dfm-ledger:askai-make`,** to take the week to any AI chat for help with next week. Only when the person wants it.

## Counts from platforms

Reading counts from a platform needs that platform's plugin: `dfm-cloudflare` reads site visits, views and visits from another site; `dfm-ghost` reads new members and the week's email numbers. A fact whose platform has no plugin installed is told by the person. When a reading fails (a missing settings line or key), show what it said. Offer to set it up or ask the person for those numbers instead.

## When a step fails

Stop. Show what the step printed. Fix what it names and run that step again: never skip a step or run a later one around it.

## Asking

- **Ask with the question dialog** where there is one: every question and every yes, with options such as "Yes, go on", "Change something" and "Stop". Where there is no dialog, the question is the last line of the message. A question in the middle of a long message is easily missed.
- **Ask for what is missing; never guess it.** When an answer could mean more than one thing, ask which.
- **Say which step this is** at the start of each message: "Step 2 of 4: counts-record".

## Next

Next week, the same again. Changes to the plan itself come from the person (or from an AI chat's `Change:` lines), never from this recipe.
