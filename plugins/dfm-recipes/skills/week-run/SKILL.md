---
name: week-run
description: Bring in the week for one business or every business: the numbers read from its platforms and told by the person, what it sent or published, recorded in the ledger, then a fresh summary, running the dfm-ledger skills in order with a yes before each write. Use at the end of a week or when someone says how their week went ("let's do this week's numbers", "do the numbers for everyone").
---

# week-run

A recipe. It does no work of its own: it runs the skills below in order. After each step, show what it did and **wait for a yes** before the next. A no stops the run where it is; nothing later runs.

It needs `dfm-ledger` installed and a ledger with settings. A ledger is a file in the working folder (`ledger.txt`, made by `dfm-ledger:plan-make`) or an object bound in settings to a store (`binding ledger <business>: ...`, with `dfm-store` installed).

## The steps

1. **`dfm-ledger:plan-check`.** The ledger must pass before anything is added. If it names problems, stop and show them. **Yes?**

2. **The week's numbers and what went out.**
   - **Read first.** For facts whose source is `cloudflare`, run `dfm-cloudflare:visits-read`; for facts whose source is `ghost`, run `dfm-ghost:numbers-read` and `dfm-ghost:said-read`; each only when its plugin is installed. Show what was read. One yes takes it all; the person may change any number.
   - **Then ask the person,** one question at a time, only for the rest: the week's count of each other fact the graph declares, a total for any fact counted that way and which of the week's steps are done. A number they do not know is left out: unknown is not zero.
   - Preview every count together with `dfm-ledger:counts-record`; preview the said lines with `dfm-ledger:plan-change`. Write both on a yes. **Yes?**

3. **`dfm-ledger:summary-make`.** Preview the new summary, then write it on a yes. Show it in full. **Yes?**

4. **If the ledger is past 75% of its store's limit,** run `dfm-ledger:weeks-archive` (it says so in its preview): old weeks move whole into the business's history, then summary-make again. **Yes?**

5. **Offer `dfm-ledger:askai-make`,** to take the week to any AI chat for help with next week. Only when the person wants it.

## Every business in settings

When the person asks for everyone ("do the numbers for everyone"), run each business with a ledger bound in settings, through the store. `dfm-store:objects-read --object ledger` lists them.

1. **For each business, copy the ledger out:** `dfm-store:object-read --out runs/<today>/<business>/ledger.txt` (beside the settings file; a new folder each run: nothing is overwritten).
2. **Run the steps above on that copy,** with these changes so the run stays short:
   - **One question per business** for the numbers only the person can tell: list that business's told facts and the week's steps in one dialog. "Don't know, skip" is an option, never chosen for them.
   - **No yes between the reads and the writes to the copy:** the copy is a working file. The yes that matters is the write back.
3. **Preview each write back** with `dfm-store:object-change --preview`. Show one short table: each business, the numbers going in and the lines it takes out and puts in. Show in full any line out that is not a count, a said line or the summary.
4. **One yes writes them all:** `object-change --go --version <the version its preview printed>`, one business after another. Each has its own version check, backup and read back. Any business the person holds back is left as it is. A business that changed since its preview stops on its own and writes nothing: say which, then run it again.

## Counts from platforms

Reading counts from a platform needs that platform's plugin: `dfm-cloudflare` reads site visits, views and visits from another site; `dfm-ghost` reads new members, the week's email numbers and what was sent or published. A fact whose platform has no plugin installed is told by the person. When a reading fails (a missing settings line or key), show what it said. Offer to set it up or ask the person for those numbers instead.

## When a step fails

Stop. Show what the step printed. Fix what it names and run that step again: never skip a step or run a later one around it.

## Asking

- **Ask with the question dialog** where there is one: every question and every yes, with options such as "Yes, go on", "Change something" and "Stop". Where there is no dialog, the question is the last line of the message. A question in the middle of a long message is easily missed.
- **Ask for what is missing; never guess it.** When an answer could mean more than one thing, ask which.
- **Say which step this is** at the start of each message: "Step 2 of 5: counts-record". For every business, also say which: "coffee-shop, step 2 of 5".

## Next

Next week, the same again. Changes to the plan itself come from the person (or from an AI chat's `Change:` lines), never from this recipe.
