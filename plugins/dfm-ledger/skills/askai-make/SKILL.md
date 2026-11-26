---
name: askai-make
description: Make the copy of a business's plan (and its profile) to paste into any AI chat, with the instructions inside: ChatGPT, Gemini or the Claude app can then help with the plan and end with Change lines to send back. Use when someone wants to ask an AI about their marketing ("help me with my plan in ChatGPT", "make the copy for an AI").
---

# askai-make

A scripted copy ([ask an AI](../../spec/ask-ai.md)). The script puts together the instructions, the profile and the ledger with a summary written fresh today; Claude runs it and hands the copy over. It changes nothing.

## What to ask the person

1. **Who the plan belongs to,** as the AI should name them. Suggest the person or business the profile names (such as their own name), not the site's short name in settings.
2. **Where the AI's response is sent:** their email address (or where they will paste it back).
3. **Whether to include their profile** (`profile.txt`, made by `dfm-content:profile-make`), when there is one.
4. **Which instructions:** the default (the dfm instructions, tried with real businesses) or a template of their own.

## The instructions are a template

The default instructions are [ask-ai-instructions.txt](../../spec/ask-ai-instructions.txt). Any text file can take their place with `--instructions <file>`: a business's own way of asking, another language, a different job for the AI. Two blanks are filled in wherever they appear: `{who}` and `{send to}`. The profile and the plan always follow it. A template that changes how the response comes back should still end in `Change:` lines if the plan is to take them.

## Run

From the working folder:

```
node <this skill's folder>/dist/run.js --ledger ledger.txt --settings settings.txt --who "<who>" --send-to "<address>" [--profile profile.txt] [--instructions <template>] --out ask-ai-copy.txt
```

Without `--out` it prints the copy. With `--out` it writes a new file, never over one: name it with today's date (`ask-ai-copy-2026-12-02.txt`) so every copy is fresh. The ledger must have no lines that cannot be read: run `dfm-ledger:plan-check` first.

Tell the person: copy all of the file, paste it into any AI chat, answer its numbered choices, then send back the response it writes at the end. The `Change:` lines in it come back into the ledger later, after their yes; nothing the AI says changes the plan by itself.

## Asking

- **Ask with the question dialog** where there is one: every question and every yes, with options such as "Yes, go on", "Change something" and "Stop". Where there is no dialog, the question is the last line of the message. A question in the middle of a long message is easily missed.
- **Ask for what is missing; never guess it.** When an answer could mean more than one thing, ask which.
- **Its script needs Node 24 or later.** If `node` is not found, ask the person how Node is installed and run the script with that Node.

## Next

To answer the copy here instead, without another AI chat: `dfm-ledger:askai-here`. Otherwise the person takes the copy to an AI chat. The response with its `Change:` lines comes back to the ledger through `dfm-ledger:plan-change`, after their yes.
