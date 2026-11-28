---
name: reply-run
description: Bring in the messages a business received (replies, comments, enquiries, an AI chat's response) and act on them: each into the ledger through inbox-read, counts-record and plan-change on a yes, then a reply drafted with message-make for each that needs one. Use when someone has messages to deal with ("here are this week's replies", "go through these comments", "she replied").
---

# reply-run

A recipe. It does no work of its own: it runs the skills below in order. After each step, show what it did and **wait for a yes** before the next. A no stops the run where it is; nothing later runs.

It needs `dfm-ledger` and `dfm-content` installed, a ledger and settings.

## The steps

1. **`dfm-ledger:inbox-read`.** The messages into the inbox, then each sorted: totals, `Change:` lines, posts they shared, what they want, what needs a reply. Show the list. **Yes?**

2. **The changes,** through the skills inbox-read named: `dfm-ledger:counts-record` for totals, `dfm-ledger:plan-change` for every other line. Each previews first. Then `dfm-ledger:plan-check` and `dfm-ledger:summary-make`. For a ledger in a store, one `dfm-store:object-change` preview of everything. **Yes?** Then write.

3. **The replies.** For each message that needs one, `dfm-content:message-make` from the person's own words: ask what they want to say. Show each with its passing check. **Yes?** They send them; no skill sends a reply.

4. **Offer `dfm-content:ideas-make`** when the messages asked questions worth a post. Only when the person wants it.

## When a step fails

Stop. Show what the step printed. Fix what it names and run that step again: never skip a step or run a later one around it.

## Asking

- **Ask with the question dialog** where there is one: every question and every yes, with options such as "Yes, go on", "Change something" and "Stop". Where there is no dialog, the question is the last line of the message. A question in the middle of a long message is easily missed.
- **Ask for what is missing; never guess it.** When an answer could mean more than one thing, ask which.
- **Say which step this is** at the start of each message: "Step 2 of 4: the changes".
