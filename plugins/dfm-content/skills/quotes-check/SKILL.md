---
name: quotes-check
description: Check that every quote, name, number and money amount in a text can be found in its source, with a script, never by reading. Use before a draft, a profile or any words made from a person's own words go anywhere ("check the quotes", "is this all from the recording", "check the profile against the site").
---

# quotes-check

A scripted check. The script proves it; Claude runs it, shows the report and never judges the text by eye.

## Run

From this skill's folder:

```
node dist/run.js --text <the text> --against <its source> [--against <another source>] [--json]
```

- `--text` is the text to check: a words file, a profile or any plain text.
- `--against` is its source: a transcript, notes, a reply or the site's `/llms-full.txt`. Give it more than once when the text draws on several, such as a profile against the site and its counts.
- `--json` gives the report as data for another script.

| Exit code | Means |
|---|---|
| 0 | passed: everything was found |
| 1 | problems found |
| 2 | the check could not run (a file is missing or the command was not understood) |

## Show

Show the report as the script printed it, in full. Do not summarise it or leave lines out. It is in the shape of [the check report](../../../../spec/check-report.md).

## When it finds problems

1. **Remove what was not found, never reword it.** Rewording an invention keeps the invention. Take out the quote, name, number or amount and anything said about it.
2. **A claim to read is a problem** until the person says it is true.
3. **Run the check again** on the changed text. A text with problems goes nowhere.
4. **Never change the source** to make a check pass.

## What it cannot catch

A claim with no quote, name or number in it ("a small team curates the content"). A person reads every text before it is kept or sent. It also cannot see a name at the start of a sentence, a number used in a different sense from the source or a quote in single quote marks.
