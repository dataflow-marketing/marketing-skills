---
name: profile-compare
description: Compare profiles made by profile-make, with a script - what changed in a business's profile between two reads (a month apart, say) part by part; also several businesses side by side. Reads only. Use when someone asks what changed on a site or in a market ("what changed in the market this month") and how businesses compare ("compare the cafes").
---

# profile-compare

A scripted read. The script compares the profiles part by part and prints exactly what it found; Claude writes a short summary **from what it printed, never from memory**. It shows both.

## Over time

```
node <this skill's folder>/dist/run.js --before <last month's profile.txt> --after <this month's profile.txt>
```

For each of the profile's parts (the counts, the fourteen parts, how they write), the sentences that went (`- `) and the sentences that came (`+ `); then how many parts stayed the same. The cheap way to a new month's profile: profile-make `--since` last month's folder, then only the pages in `changed.txt` are read again and only the parts they touch are rewritten.

## Side by side

```
node <this skill's folder>/dist/run.js --side-by-side <name>=<profile.txt> <name>=<profile.txt> ...
```

Each part, then what each business's profile says in it: the sheet a comparison is written from. A comparison says only what the profiles say; a gap is a part where one business says something the others do not.

| Exit code | Means |
|---|---|
| 0 | compared |
| 2 | refused or failed: a profile that cannot be read or a command not understood |

## Writing the summary

- **Only what it printed.** Every point names the business and the part it came from.
- **Their words stay theirs.** A quote is copied from the profile, which quotes-check already proved against the site.
- **Never their words in a business's own plan.** A comparison informs what a business does in its own voice.

## Asking

- **Ask with the question dialog** where there is one: every question and every yes. Where there is no dialog, the question is the last line of the message.
- **Its script needs Node 24 or later.** If `node` is not found, ask the person how Node is installed and run the script with that Node.
