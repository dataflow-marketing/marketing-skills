---
name: share-make
description: Make the words to share a post or a clip on a channel (LinkedIn, a group, Instagram, an email to a list) from the post's own words and the person's own, nothing invented, written as a words file and checked with dfm-content:quotes-check. Use when someone wants to share something they made ("write the LinkedIn share for this post", "share this clip in the group", "what do I say when I post this").
---

# share-make

A guided words skill. Claude does the writing; the check proves it. There is no script: the guardrail is `dfm-content:quotes-check`, run after every draft.

## Start from their words

1. **Ask what is being shared:** the post or clip itself, as a words file (made by `dfm-content:post-make`) or its published page. Read all of it.
2. **Ask where it goes:** the channel, as the ledger names it (`channel LinkedIn: ...`). Also who it is for, when the person says.
3. **Ask what they want to say about it,** in their own words: why they made it, what it cost them, who it is for. A sentence or two is enough. Keep what they say as a source file beside the share (such as `drafts/iced-coffee.share-notes.txt`).
4. **No source, no share.** A share is built from the post's words and what they said, never from a topic.
5. **Read the house rules** in the person's [settings](../../spec/settings.md). They apply to everything written. A channel may have its own: `house rule LinkedIn: no link in the post, the link in the first comment`.

## Polish, never invent

- **Their sentences first.** Open with what they said about it, then the post's own line that carries it. Cut, join, reorder; never add.
- **Invent nothing.** No fact, name, number, quote, claim, hashtag or call to action that is not in a source.
- **One ask at most,** and only one they gave: "tell me if this happens to you", "the link is in the comments". None is fine.
- **The link** goes where the channel's house rule says; with no rule, ask. It is the link in the words file's `link` field, never a link of your own.
- **Fit the channel:** keep it to what the channel shows before "see more" when the person says so (a house rule says how long). Never a thread, a carousel or a second post unless they ask.
- **The same share is never written twice for two channels:** each channel gets its own words file.

## Write the words file

A new file in the shape of [words](../../spec/words.md), never over an existing one:

```
spec 1
kind: share
state: draft
channel: LinkedIn
link: https://coffee-shop.example/iced-coffee/
from: drafts/iced-coffee.share-notes.txt
=== body ===
The first hot morning always brings the same question at the counter.

Iced coffee is back from Monday. The link is in the comments.
```

- `kind` is `share`, `state` is `draft`.
- `link` names the post it points to (the words spec's rule 3).
- `from` names the person's notes. The post itself is checked as a second source.

## Check it

```
node <quotes-check folder>/dist/run.js --text drafts/iced-coffee.linkedin.txt --against drafts/iced-coffee.share-notes.txt --against drafts/iced-coffee.txt > drafts/iced-coffee.linkedin.check.txt
```

1. **Show the report in full.**
2. **Remove, never reword,** anything not found.
3. **Check the house rules** after writing (length, words to avoid, the link's place): never trust them.
4. **Run the check again** after every change, until it says `result: passed`.

## Show the person

Show the words file and the passing report. The person reads every word. They post it themselves: no skill posts a share. When it is out, `dfm-ledger:plan-change` can add its `said` line on their yes.

## Asking

- **Ask with the question dialog** where there is one: every question and every yes. Where there is no dialog, the question is the last line of the message.
- **Ask for what is missing; never guess it.** When an answer could mean more than one thing, ask which.
