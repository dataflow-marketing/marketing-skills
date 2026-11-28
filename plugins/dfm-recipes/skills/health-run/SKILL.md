---
name: health-run
description: Check a site's health: whether AI tools can read it (llms-check), which links do not work for a visitor (links-check) and what the site says now (profile-make, its profile checked), each step shown before the next. Reads only: nothing on the site changes. Use for a new client's site, before a launch or now and then on any site ("check my site", "is my site healthy", "a health check for this client").
---

# health-run

A recipe. It does no work of its own: it runs the skills below in order. After each step, show what it did and **wait for a yes** before the next. A no stops the run where it is; nothing later runs.

It needs `dfm-site` and `dfm-content` installed. Every step only reads the site. A check of the site's payment links joins it when `dfm-stripe` is built.

## The steps

1. **The site.** Its address from settings; otherwise ask. **Yes?**

2. **`dfm-site:llms-check`.** Is `/llms.txt` on, what it holds, is `/llms-full.txt` there. **Yes?**

3. **`dfm-site:links-check`.** The links that do not work, with the pages they are on. **Yes?**

4. **`dfm-content:profile-make`.** What the site says now and how it says it, checked with quotes-check. With a profile from before, `--since` that read and `dfm-content:profile-compare` shows what changed. **Yes?**

5. **What to fix.** One short list from what the steps printed, in the order they found it: never a fix the steps did not find. The person fixes their own site.

## When a step fails

Stop. Show what the step printed. Fix what it names and run that step again: never skip a step or run a later one around it.

## Asking

- **Ask with the question dialog** where there is one: every question and every yes, with options such as "Yes, go on", "Change something" and "Stop". Where there is no dialog, the question is the last line of the message.
- **Say which step this is** at the start of each message: "Step 3 of 5: links-check".
