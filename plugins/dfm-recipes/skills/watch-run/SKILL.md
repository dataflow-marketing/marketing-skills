---
name: watch-run
description: Keep a market under watch: on a schedule, on the person's own computer, a script reads every site again with code only (watch.sh, run by cron); then in a session this recipe writes what changed into each market ledger, checks it and makes the month's report, a yes before every write. Use to set up a market's scheduled read ("watch these sites every month", "read the competitors on a schedule") or when a scheduled read has run ("the watch ran", "what changed this month").
---

# watch-run

A recipe in two halves. **The scheduled half** is `watch.sh`, in this skill's folder: code only, it reads and never judges. **The session half** is the steps below: they run skills in order, show what each did and **wait for a yes** before the next. A no stops the run where it is.

It needs `dfm-content` and `dfm-recipes` installed and a market folder (see `dfm-recipes:market-run`).

## Set it up

1. **The market folder:** its `settings.txt` names each site (`site <name>: public <address>`) and the market's time zone (`time zone: Australia/Melbourne`). The first read of a site is done in a session, with `dfm-recipes:market-run`.
2. **Run it once by hand,** to see it work: `NODE=<path to node> <this skill's folder>/watch.sh <market folder>`.
3. **Schedule it with cron** on the computer that holds the market folder, on the person's yes. Cron runs with almost nothing set up: name node by its full path. Cron's clock may not be the market's: 21:00 UTC on the 1st is 08:00 on the 2nd in Melbourne in summer (07:00 in winter). For example, once a month:

   ```
   0 21 1 * * NODE=/home/ubuntu/.nvm/versions/node/v24.22.0/bin/node /path/to/watch-run/watch.sh /path/to/market >> /path/to/market/watch.log 2>&1
   ```

   Show the line before adding it with `crontab -e`; never add it without a yes. The computer must be on at that time: a read it misses is not run later.

It reads each site with `profile-make --since` its last read and adds the read to a new market ledger with `market-read --read`, both into a folder named for the day. It writes nothing over an earlier read. It never changes a ledger the person wrote in. It leaves `watch-<day>.txt`: what changed at each site; a site that could not be read.

## After a scheduled read

1. **The note.** Show `watch-<day>.txt`. A site that could not be read is left out of this read: never reuse last month's. **Yes?**

2. **What changed,** site by site, for each site with something new, changed or gone: `dfm-content:market-read` step 3 on the new ledger: the graph changed to what the site shows now, `new`, `was` and `gone` lines from `changed.txt`, then `--summary` and quotes-check. A site the same as last time needs no writing. Show what changed in each. **Yes?**

3. **The profiles, the compare and the report:** `dfm-recipes:market-run` from its step 3 (bring each profile up to date), with this read as the read. Show the report. **Yes?**

## When a step fails

Stop. Show what the step printed. Fix what it names and run that step again: never skip a step or run a later one around it. A scheduled read that failed leaves its note and its log: read them first.

## Asking

- **Ask with the question dialog** where there is one: every question and every yes. Where there is no dialog, the question is the last line of the message.
- **Ask for what is missing; never guess it.** When an answer could mean more than one thing, ask which.
- **Say which step this is** at the start of each message: "Step 2 of 3: what changed".
