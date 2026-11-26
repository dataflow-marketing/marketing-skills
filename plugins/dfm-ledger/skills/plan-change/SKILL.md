---
name: plan-change
description: Make the Change lines from an AI chat's response (made with askai-make) into a business's ledger, showing each line added or replaced first and writing only after a yes. Use when someone brings back what an AI chat settled ("here is what ChatGPT said", "put these changes in my plan") or has Change lines of their own.
---

# plan-change

A scripted write ([the way back](../../spec/ask-ai.md)). The script finds every `Change:` line, works out where each goes and what it replaces, previews it, writes it on a yes and reads it back. Claude runs it; Claude never edits the ledger by hand.

## What it does with each line

- **Added** at the end of its part (graph, plan or done): a new step, link, fact or said line.
- **Replaced:** a line that takes another's place: a step's `how` or `ask`, the goal, the start, a fact's source, a link's rate. A step's `script` lines replace its earlier script lines as a set.
- **Already there:** left alone.
- **Not a ledger line:** the whole change is refused and nothing is written. Show the line and ask the person what they meant; never reword it yourself.

Everything else in the response (the why, a finished post) is not a change and is left alone.

## Run

Save the response as it came, in a new file in the working folder (such as `ai-response.txt`). Then:

```
node <this skill's folder>/dist/run.js --ledger ledger.txt --settings settings.txt --changes ai-response.txt
```

1. **Preview** (the default) shows each line. Show it in full and ask: **write it?**
2. On a yes, run again with `--go`. It writes, reads back and logs the run in the run log.
3. `--read-back` checks again later that every line is there.

## Asking

- **Ask with the question dialog** where there is one: every question and every yes, with options such as "Yes, go on", "Change something" and "Stop". Where there is no dialog, the question is the last line of the message. A question in the middle of a long message is easily missed.
- **Ask for what is missing; never guess it.** When an answer could mean more than one thing, ask which.
- **A change is the person's.** Nothing the AI said goes in without their yes, line by line if they want.
- **Its script needs Node 24 or later.** If `node` is not found, ask the person how Node is installed and run the script with that Node.

## Next

`dfm-ledger:plan-check`, then `dfm-ledger:summary-make` for a fresh summary.
