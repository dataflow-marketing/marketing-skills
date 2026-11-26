---
name: post-make
description: Make a post from a person's own words (a transcript of a recording, their notes or a reply), polished shorter and plainer with nothing invented, written as a words file and checked with dfm-content:quotes-check. Use when someone has said or written what a post should say ("make a post from this recording", "turn my notes into a post") or as a step of dfm-recipes:recording-run.
---

# post-make

A guided words skill. Claude does the writing; the check proves it. There is no script: the guardrail is `dfm-content:quotes-check`, run after every draft.

## Start from their words

1. **Ask for the source:** a transcript of a recording, the person's notes or a reply they wrote. It is a plain text file. Read all of it.
2. **No source, no post.** A topic, a title or an idea is not a source. Ask the person to say or write what they want to say first.
3. **A recording with no transcript** is made into one by hand for now: the person types it or uses a tool they already have. Use the transcript, not a summary of it.
4. **Read the house rules** in the person's [settings](../../../../spec/settings.md) (spelling, length, words to avoid). They apply to everything written.

## Polish, never invent

Make it shorter and plainer with the same meaning.

- **Keep their sentences.** Cut filler, false starts, repeats and asides. Join two halves of a thought said apart. Change the order only when it reads more clearly.
- **Keep their words for things.** If they say "regulars", the post says "regulars".
- **Invent nothing.** No fact, name, number, price, date, quote, claim or call to action that is not in the source. No opening line, closing line or summary of your own.
- **Ask about what you cannot make out.** A word or sentence that makes no sense (often a word the transcript misheard) is asked about: "I could not make out 'today is all about black'. What did you say?" Never cut it or guess it: it may be the point of the post. Leave something out only when the person says to.
- **The title and excerpt are their words too,** taken from the source, not written fresh.

## Write the words file

Write a new file in the shape of [words](../../../../spec/words.md), such as `drafts/iced-coffee.txt`. Never write over an existing one.

```
spec 1
kind: post
state: draft
title: Iced coffee is back
excerpt: From Monday, with cake from the bakery next door.
channel: website
from: recordings/2026-11-28-sam.txt
=== body ===
The first hot morning always brings the same question at the counter.

Iced coffee is back from Monday.
```

- `state` is `draft`. It becomes `approved` only when the person says yes to the words.
- `from` names the source file exactly as it is on disk: the check reads it.
- Add `link`, `tags`, `topic`, `for`, `ask` or `campaign` only when the person gives them.

## Check it

Run `dfm-content:quotes-check` against the source and save its report beside the words file:

```
node <quotes-check folder>/dist/run.js --text drafts/iced-coffee.txt --against recordings/2026-11-28-sam.txt > drafts/iced-coffee.check.txt
```

1. **Show the report in full.**
2. **Remove, never reword,** anything not found: the quote, name, number or amount and what was said about it. Rewording an invention keeps the invention.
3. **A claim to read** stays out until the person says it is true.
4. **Run the check again** after every change, until it says `result: passed`. Save the passing report: `dfm-ghost:post-draft` needs it.
5. **Never change the source** to make the check pass.

## Show the person

Show the words file and the passing report. The person reads every word: the check cannot catch a claim with no quote, name or number in it.

## Asking

- **Ask with the question dialog** where there is one: every question and every yes, with options such as "Yes, go on", "Change something" and "Stop". Where there is no dialog, the question is the last line of the message. A question in the middle of a long message is easily missed.
- **Ask for what is missing; never guess it.** When an answer could mean more than one thing, ask which.

## Next

`dfm-ghost:post-draft` puts the checked words file on Ghost as a draft. In `dfm-recipes:recording-run`, go back to the recipe's next step.
