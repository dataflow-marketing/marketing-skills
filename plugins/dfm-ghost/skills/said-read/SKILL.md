---
name: said-read
description: Read what a business sent or published in a week from its Ghost site (by email, on the website or both), as said lines in its own words, with a script. Reads only: dfm-ledger:plan-change adds the lines on a yes. Use when someone asks what a business put out this week ("what did we send this week", "what went out") and in step 2 of dfm-recipes:week-run.
---

# said-read

A scripted read. The script asks Ghost and writes the lines; Claude runs it and shows what it printed. It writes nothing: the lines go to `dfm-ledger:plan-change`, which previews them and adds them to the ledger's done part on a yes.

## What it reads

Every Ghost site the ledger's facts name (`fact new subscribers: ghost coffee-shop new members` names `coffee-shop`). For each post that went out in the week, one said line:

```
2026-11-30 said by email and on the website on 2026-12-01: "Iced coffee is back" https://coffee-shop.example/iced-coffee/ [Regulars] summary: "Iced coffee is back from Monday."
```

- **How:** `by email`, `on the website` or `by email and on the website`. A post counts in the week it was emailed or published, whatever date it carries. Drafts and scheduled posts never count.
- **The day:** in the settings' time zone.
- **Who for:** each group whose rule is a tag the post carries (`group Regulars: tag regulars`), in the ledger's order; otherwise `everyone`.
- **Summary:** the excerpt they wrote; without one, the post's first two sentences. Their words, never written for them.

## Run

From the working folder:

```
node <this skill's folder>/dist/run.js --ledger ledger.txt --settings settings.txt [--week <Monday>]
```

It prints each line as a `Change:` line. To add them, save those lines in a file and run `dfm-ledger:plan-change` with it: a line already in the ledger is left alone. `--json` gives `changeLines` ready to save.

| Exit code | Means |
|---|---|
| 0 | read (also when nothing went out or no fact names a Ghost site) |
| 2 | refused or failed: no Ghost line in settings for a site, no keys file or no key, a week not begun, Ghost refused |

## Asking

- **Ask with the question dialog** where there is one: every question and every yes, with options such as "Yes, go on", "Change something" and "Stop". Where there is no dialog, the question is the last line of the message. A question in the middle of a long message is easily missed.
- **Ask for what is missing; never guess it.** When an answer could mean more than one thing, ask which.
- **Its script needs Node 24 or later.** If `node` is not found, ask the person how Node is installed and run the script with that Node.

## Next

`dfm-ledger:plan-change` with the Change lines, after the person's yes. In `dfm-recipes:week-run` that is part of step 2.
