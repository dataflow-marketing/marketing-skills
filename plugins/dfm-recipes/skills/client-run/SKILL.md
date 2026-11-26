---
name: client-run
description: Set up a business in dfm: its website in settings, a checked profile of what its site says and how it says it plus a first plan, running the dfm skills in order with a yes between each. Use when someone is new to dfm or is setting up a business ("set up my business", "I'm new, where do I start?", "add a client").
---

# client-run

A recipe. It does no work of its own: it runs the skills below in order. After each step, show what it did and **wait for a yes** before the next. A no stops the run where it is; nothing later runs.

It needs `dfm-content` and `dfm-ledger` installed, with the plugin for the site's platform. Work in one working folder for the whole run: settings, the site as read and the profile all live there.

## The steps

1. **The site.** Every site starts the same way, as a public website, whatever it is built on. Ask which kind of site it is, listing the choices in this order:
   - **Any website (the start for every site):** `dfm-site:site-add`. Its name and address, no key. dfm reads it and never writes to it. Describe this choice only as "any website": never name site builders or platforms for it.
   - **Ghost:** `dfm-ghost:site-add` in place of the above. Its description says what it adds: dfm can also put drafts on the site. It also names the variable its key is kept in; a first run asks for the keys file too. The person puts the key in the keys file themselves, never in the chat.

   Name each choice by what it is ("Any website", "Ghost"); what it lets dfm do goes in its description. More platforms get their own plugin as they are needed; say so, never pretend one exists.

   **Yes?**

2. **`dfm-content:profile-make`.** Reads the site's home page and its pages (`/llms-full.txt`; with a yes, the pages its sitemap lists), writes the profile and checks it with `dfm-content:quotes-check`. Show the profile and the passing report. **Yes?**

3. **`dfm-ledger:plan-make`.** A first plan: the starter plan, starting this week, shaped with the person one thing at a time and checked with `dfm-ledger:plan-check`. Show the ledger and the passing report. **Yes?**

## What comes later

Keeping the profile and the plan in Ghost joins this recipe when the store skills are built.

## When a step fails

Stop. Show what the step printed. Fix what it names and run that step again: never skip a step or run a later one around it.

## Asking

- **Ask with the question dialog** where there is one: every question and every yes, with options such as "Yes, go on", "Change something" and "Stop". Where there is no dialog, the question is the last line of the message. A question in the middle of a long message is easily missed.
- **Ask for what is missing; never guess it.** When an answer could mean more than one thing, ask which.
- **Say which step this is** at the start of each message: "Step 1 of 3: site-add".

## Next

With the site, profile and plan in place: each week `dfm-recipes:week-run` records what happened and sums it up; `dfm-ledger:askai-make` takes the plan to any AI chat; a Ghost site can also use `dfm-recipes:recording-run` (a recording to a checked draft post). Say so and ask which, if any, to start.
