---
name: numbers-read
description: Read a week's numbers from a Ghost site's Admin API (new members; the emails sent that week, their opens and clicks) for every fact in a ledger whose source is a Ghost measure, with a script. Reads only: dfm-ledger:counts-record records the numbers on a yes. Use when someone asks for their email or member numbers for a week ("how many opened this week's email", "new members this week") and in step 2 of dfm-recipes:week-run.
---

# numbers-read

A scripted read. The script asks Ghost and adds up; Claude runs it and shows what it printed. It writes nothing: the numbers go to `dfm-ledger:counts-record`, which previews them and writes them on a yes.

## Which facts

Every fact in the ledger's graph whose source is `ghost <site> <measure>`, the site being a settings site name:

```
fact new subscribers: ghost coffee-shop new members
fact opens: ghost coffee-shop email opens
```

| Measure | Counts, for the week |
|---|---|
| `new members` | members who joined, the person's own addresses (`own email:` lines in settings) left out |
| `emails` | emails sent: a post sent as an email counts in the week it was sent |
| `emails sent` | the people those emails went to |
| `email opens` | their opens |
| `email clicks` | their clicks |

A fact with another Ghost measure is named as `not read`: ask the person for it or leave it out.

## The week

From the week's Monday at 00:00 in the settings' time zone to the next Monday at 00:00. This week ends now.

## Run

From the working folder:

```
node <this skill's folder>/dist/run.js --ledger ledger.txt --settings settings.txt [--week <Monday>]
```

Show what it printed in full. It ends with the `dfm-ledger:counts-record` line that records the numbers. `--json` gives the same as data, with `countArgs` ready to pass on.

| Exit code | Means |
|---|---|
| 0 | read (or no fact comes from Ghost: nothing to read) |
| 2 | refused or failed: no Ghost line in settings for a site, no keys file or no key, a week not begun, Ghost refused |

## Settings

Each site needs its Ghost line, added by `dfm-ghost:site-add`. The person's own addresses go in `own email:` lines, one a line: their own sign ups are never counted.

```
site coffee-shop: ghost https://coffee-shop.example key in COFFEE_SHOP_GHOST_ADMIN_KEY
keys file: ~/.config/dfm/.env
own email: owner@coffee-shop.example
```

When there are no `own email:` lines, ask the person once which addresses are their own and add them on a yes.

## Asking

- **Ask with the question dialog** where there is one: every question and every yes, with options such as "Yes, go on", "Change something" and "Stop". Where there is no dialog, the question is the last line of the message. A question in the middle of a long message is easily missed.
- **Ask for what is missing; never guess it.** When an answer could mean more than one thing, ask which.
- **Its script needs Node 24 or later.** If `node` is not found, ask the person how Node is installed and run the script with that Node.

## Next

`dfm-ledger:counts-record` with the `--count` line it printed, after the person's yes. In `dfm-recipes:week-run` that is part of step 2.
