---
name: message-make
description: Make a direct message or a one to one email from the person's own words (what they want to say and, for a reply, the message they are answering), short and in their voice, nothing invented, written as a words file and checked with dfm-content:quotes-check. Use when someone wants to write to one person ("help me reply to this", "write a DM to say thanks", "an email to follow up with her").
---

# message-make

A guided words skill. Claude does the writing; the check proves it. There is no script: the guardrail is `dfm-content:quotes-check`, run after every draft.

## Start from their words

1. **Ask who it is to,** by the name the person uses for them. Then on which channel: a DM on a platform, an email.
2. **Ask what they want to say,** in their own words: a sentence or two, said or typed. Keep it as a source file (such as `messages/sam-thanks.notes.txt`). **No source, no message:** "say thanks" is a topic, not words.
3. **For a reply, ask for the message being answered** and keep it as a second source. Read all of it.
4. **Read the house rules** in the person's [settings](../../spec/settings.md): length, spelling, words to avoid. A message usually has its own: `house rule message length: three sentences at most`.

## Short, plain and theirs

- **Short.** Two or three sentences unless a house rule or the person says otherwise. Read it aloud: it should sound like them talking.
- **Their sentences.** Polish what they said: shorter, plainer, the same meaning. Keep their words for things.
- **Invent nothing.** No fact, name, number, date, compliment, memory or claim that is not in a source.
- **Never quote their message back at length.** For a reply, answer it; a few of their words to show what you are answering is the most.
- **No offer at the end they did not make.** No "let me know if you need anything", no "happy to help", no question that was not theirs. When the person has said all they want to say, the message ends there.
- **A link only when they ask for one,** and only one they gave. Where a link goes is a house rule or their call: never a hyperlink on a call to action they did not write.
- **Who it is to stays theirs.** Use the name as the person gives it. Nothing about the other person goes in that the sources do not say.

## Write the words file

A new file in the shape of [words](../../spec/words.md), never over an existing one:

```
spec 1
kind: message
state: draft
channel: LinkedIn
for: Sam
from: messages/sam-thanks.notes.txt
=== body ===
Thanks for sharing the iced coffee post, Sam.

The first hot morning always brings the same question at the counter.
```

- `kind` is `message`, `state` is `draft`.
- `for` is who it is to, by the name the person gave.
- `link` only when the message points to something.

## Check it

```
node <quotes-check folder>/dist/run.js --text messages/sam-thanks.txt --against messages/sam-thanks.notes.txt [--against messages/sam-thanks.their-message.txt] > messages/sam-thanks.check.txt
```

1. **Show the report in full.**
2. **Remove, never reword,** anything not found.
3. **Check the house rules** after writing (its length above all): never trust them.
4. **Run the check again** after every change, until it says `result: passed`.

## Show the person

Show the words file and the passing report. The person reads every word and sends it themselves: no skill sends a message. A message to one person is never recorded as a `said` line: the ledger counts groups, never individuals.

## Asking

- **Ask with the question dialog** where there is one: every question and every yes. Where there is no dialog, the question is the last line of the message.
- **Ask for what is missing; never guess it.** When an answer could mean more than one thing, ask which.
