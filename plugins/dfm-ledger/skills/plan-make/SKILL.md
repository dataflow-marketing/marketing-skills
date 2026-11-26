---
name: plan-make
description: Make a business's first ledger: start from the starter plan (four steps a week), then shape it in conversation one thing at a time, checked with dfm-ledger:plan-check. Use when a business has no plan yet ("make me a marketing plan", "where do I start each week") and as a step of dfm-recipes:client-run.
---

# plan-make

A words skill with a script. The script starts the ledger from the [starter plan](https://github.com/dataflow-marketing/marketing-skills/blob/develop/examples/starter/README.md); Claude shapes it with the person, one thing at a time; `dfm-ledger:plan-check` proves every line reads.

## 1. Start from the starter plan

Ask how many followers they have today, across their main channel, if they know. Never guess it: leave it out if they do not know.

```
node <this skill's folder>/dist/run.js --ledger ledger.txt --settings settings.txt [--followers <n>] --preview
```

Show the preview, ask for a yes, then run it again with `--go`. It writes `ledger.txt`: the starter plan starting this week. It never writes over a ledger that is there.

The starter: four steps a week in order (check your profiles, new post, post once on social, reply to comments), a goal of one more follower a week; two facts told by the person (followers, comments). Every link is `?`: nothing is known yet. That is the point.

## 2. Shape it, one thing at a time

Ask, one question at a time in the dialog:

1. **The goal.** Keep "one more follower a week" or change it to what the business actually wants each week: enquiries, bookings, sales, sign ups. A goal is a count of actions a week, never money.
2. **What they can count.** Each thing they can tell each week becomes a fact, with a link from the step that leads to it (`?` until it is counted).
3. **The how lines.** The starter's how lines are written for a business people visit (opening times, a customer's question). If the profile shows a different kind of business, show each how line and ask whether it fits. If one does not, ask how they would say it: their words, polished shorter and plainer, never yours.
4. **One change to the steps,** only if they want one now. Every step needs a link from it in the graph.

**Every change goes through `dfm-ledger:plan-change`;** never edit `ledger.txt` by hand. Write what was agreed as `Change:` lines in a new file (such as `plan-changes.txt`), in plain ASCII as [ledger](../../spec/ledger.md) shows:

```
Change: want enquiries +1 a week
Change: fact enquiries: told
Change: fact site visits: told
Change: new post -> site visits: ? (unknown)
Change: how check your profiles: Check your LinkedIn and your About page say what you do now.
```

A `want`, a `how` or a fact's source replaces the line before it; the rest are added. Run plan-change to preview, show it, then `--go` on a yes. Change only what they said: every other line of the starter stays as it is.

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
