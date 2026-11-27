---
name: market-run
description: Read a business's market again, a month after the last read: every other business's site read for only what changed, their profiles brought up to date and checked, what changed and a side by side with the business's own profile, then the month's report, running the dfm-content skills in order with a yes between each. Use when someone wants to know what moved in their market ("do the market for this month", "what changed in my market", "read the competitors again").
---

# market-run

A recipe. It does no work of its own: it runs the skills below in order. After each step, show what it did and **wait for a yes** before the next. A no stops the run where it is; nothing later runs.

It needs `dfm-content` and `dfm-site` installed.

## The market folder

One folder holds a market, read after read:

```
<market folder>/
  settings.txt          a site line for every other business in the market
  own-profile.txt       the business's own checked profile (from profile-make)
  <read>/               one folder each read, such as month-3 or 2027-01
    <site>/             what profile-make read and the site's checked profile
    compare.txt         what changed since the last read, every business
    side-by-side.txt    this read's profiles side by side, the business's own first
    report.md           the month's report
```

The **last read** is the read folder before this one. A first read has none: every site is read in full and nothing is compared over time.

Reads only what each site makes public. Profiles businesses, never private people. Their words stay in their profiles and the report: never in the business's own posts or plan.

## The steps

1. **The market.** From the market folder, show the sites in settings, the own profile and the last read. Ask, one question at a time:
   - **This read's name.** Offer the next in the series (after `month-2`, `month-3`; after `2026-12`, `2027-01`).
   - **Anyone new to add? Anyone gone?** A new business is added with `dfm-site:site-add`. A business gone stays in settings until the person removes it.

   **Yes?**

2. **Read every site.** For each site in settings, `dfm-content:profile-make`'s script with `--folder <read>/<site>` plus `--since <last read>/<site>` when the last read has that site. Use `--from-sitemap` for a site the last read read that way; ask before using it for a new site. One after another, no yes between them: these are reads into a new folder. Then show one table: each site, its pages, its posts and how many pages were new, changed or gone (from `changed.txt`). A site with none of them is **the same as last time**. **Yes?**

3. **Bring each profile up to date.** For each site, with profile-make's rules:
   - **The same as last time:** copy the last profile, then copy in this read's counted part.
   - **Something changed:** copy the last profile, copy in this read's counted part, then rewrite only the parts the pages in `changed.txt` touch. A part no page touched is left word for word.
   - **New to the market:** write its profile in full.

   Check each with `dfm-content:quotes-check` against that read's pages, home page and counted part, until each says `result: passed`. Show only what changed in each profile, never all of them in full, with each passing report. **Yes?**

   **Each market ledger too,** where the market keeps them: `dfm-content:market-read` adds the read (`--ledger <last read>/market-<site>.txt --out <read>/market-<site>.txt`), then the graph lines and what changed, then its summary and check.

4. **What changed and side by side.** `dfm-content:profile-compare`:
   - **Over time:** `--before <last read>/<site>/profile.txt --after <read>/<site>/profile.txt` for every site the last read has, one after another into `<read>/compare.txt`, each under a line `######## <site>`. A new site is listed as `######## <site>` then `new to the market`.
   - **Side by side:** `--side-by-side own=own-profile.txt <site>=<read>/<site>/profile.txt ...` into `<read>/side-by-side.txt`, the business's own first.

   Show `compare.txt` in full. **Yes?**

5. **`dfm-content:market-report`.** The month's report from what step 4 printed, in last month's layout, checked. Show it in full. **Yes?**

## When a step fails

Stop. Show what the step printed. Fix what it names and run that step again: never skip a step or run a later one around it. A site that cannot be read this time (down, moved) is named in the table at step 2 and left out of the read: never reuse last month's read as this month's.

## Asking

- **Ask with the question dialog** where there is one: every question and every yes, with options such as "Yes, go on", "Change something" and "Stop". Where there is no dialog, the question is the last line of the message. A question in the middle of a long message is easily missed.
- **Ask for what is missing; never guess it.** When an answer could mean more than one thing, ask which.
- **Say which step this is** at the start of each message: "Step 2 of 5: read every site".

## Next

Next month, the same again. What the business does about it is the person's call, in its own voice: `dfm-ledger:plan-change` takes a new step into its plan.
