---
name: calendar-run
description: Plan what a business makes next from what people asked: ideas with ideas-make, then the person answers the one they pick in their own words, post-make makes the post and plan-change puts its step in the plan, each on a yes. Use when someone wants to plan their content ("what should I post next month", "plan the next few posts", "turn these questions into posts").
---

# calendar-run

A recipe. It does no work of its own: it runs the skills below in order. After each step, show what it did and **wait for a yes** before the next. A no stops the run where it is; nothing later runs.

It needs `dfm-content` and `dfm-ledger` installed, a ledger and settings. Making a run of weeks ahead (`schedule-make`) joins this recipe when it is built.

## The steps

1. **`dfm-content:ideas-make`.** Up to five ideas, each a question people asked, with how often and why now, checked. **Yes?**

2. **Pick and answer.** The person picks an idea (or more), then answers it in their own words: a recording, notes or a reply. No answer, no post: wait for it. **Yes?**

3. **`dfm-content:post-make`.** The post from their answer, checked. Show it with its passing check. **Yes?**

4. **When it goes out.** Ask when they will publish it, then `dfm-ledger:plan-change` with one line in the plan's words: `Change: <its Monday> + <the post's step>`, with `Change: how <the post's step>: <the post's title>`. Preview, then **yes?** Then write.

5. **Offer `dfm-content:share-make`,** for the words to share it. Only when the person wants it.

## When a step fails

Stop. Show what the step printed. Fix what it names and run that step again: never skip a step or run a later one around it.

## Asking

- **Ask with the question dialog** where there is one: every question and every yes, with options such as "Yes, go on", "Change something" and "Stop". Where there is no dialog, the question is the last line of the message. A question in the middle of a long message is easily missed.
- **Ask for what is missing; never guess it.** When an answer could mean more than one thing, ask which.
- **Say which step this is** at the start of each message: "Step 3 of 5: post-make".
