---
name: plan-make
description: Make a business's first ledger: start from the starter plan (four steps a week), then shape it in conversation one thing at a time, checked with dfm-ledger:plan-check. Use when a business has no plan yet ("make me a marketing plan", "where do I start each week") and as a step of dfm-recipes:client-run.
---

# plan-make

A words skill with a script. The script starts the ledger from the [starter plan](../../../../examples/starter/README.md); Claude shapes it with the person, one thing at a time; `dfm-ledger:plan-check` proves every line reads.

## 1. Start from the starter plan

Ask how many followers they have today, across their main channel, if they know. Never guess it: leave it out if they do not know.

```
node <this skill's folder>/dist/run.js --ledger ledger.txt --settings settings.txt [--followers <n>] --preview
```

Show the preview, ask for a yes, then run it again with `--go`. It writes `ledger.txt`: the starter plan starting this week. It never writes over a ledger that is there.

The starter: four steps a week in order (check your profiles, new post, post once on social, reply to comments), a goal of one more follower a week; two facts told by the person (followers, comments). Every link is `?`: nothing is known yet. That is the point.

## 2. Shape it, one thing at a time

Ask, one question at a time in the dialog:

1. **The goal.** Keep "one more follower a week" or change it to what the business actually wants each week: enquiries, bookings, sales, sign ups. A goal is a count of actions a week, never money. If it changes: change the `want` line and add a `fact <name>: told` line for it.
2. **What they can count.** For each thing they can tell each week, add a `fact <name>: told` line and a link from the step that leads to it with `? (unknown)`.
3. **One change to the steps,** only if they want one now. Every step needs a link from it in the graph.

Change only what they said. Keep every other line of the starter as it is. Write lines in plain ASCII as [ledger](../../../../spec/ledger.md) shows: `->` for a link.

## 3. Check it

```
node <plan-check folder>/dist/run.js --ledger ledger.txt --settings settings.txt
```

Fix what it names and run it again until it says `result: passed`. Show the ledger and the passing report.

## Asking

- **Ask with the question dialog** where there is one: every question and every yes, with options such as "Yes, go on", "Change something" and "Stop". Where there is no dialog, the question is the last line of the message. A question in the middle of a long message is easily missed.
- **Ask for what is missing; never guess it.** When an answer could mean more than one thing, ask which.
- **Its script needs Node 24 or later.** If `node` is not found, ask the person how Node is installed and run the script with that Node.

## Next

In `dfm-recipes:client-run`, go back to the recipe. On its own: each week `dfm-ledger:counts-record` adds what happened and `dfm-ledger:summary-make` sums it up (`dfm-recipes:week-run` does both).
