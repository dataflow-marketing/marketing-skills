---
name: ideas-make
description: Find what to make next and why, from the questions people actually asked (replies, comments, enquiries), what the business already answers on its site and what its neighbours answer that it does not; each idea is a question as it was asked, with how often and by which group, written as a words file with state idea and checked with dfm-content:quotes-check. It never writes the post. Use when someone asks what to post or make next ("what should I write about", "give me ideas for next month", "what are people asking").
---

# ideas-make

A guided words skill. Claude finds and groups the questions; the check proves every one was asked, word for word. There is no script. It never writes the post: the person answers the question in their own words and `dfm-content:post-make` makes the post.

## What it reads

Ask for each, then read all of what is given. None is required; with no questions there are no ideas.

1. **What people asked:** replies, comments, enquiries, messages, as plain text files in one folder. The person gives them; a skill never reads anyone's inbox on its own.
2. **The business's ledger:** its said lines (what it already sent or published, with their topics) and its groups.
3. **Its profile** (made by `dfm-content:profile-make`): "questions the site answers".
4. **Its neighbours' ledgers,** when the person keeps a market (made by `dfm-content:market-read`): their `answers` lines, the questions their sites answer.

## Find the questions

1. **Copy each question word for word** from where it was asked, with the file it is in. A question is what someone asked, even without a question mark ("I never know which milk to choose"). Keep a list in `ideas/<today>/questions.txt`: the question, the file, the group the sender is in when the ledger's groups say.
2. **No one is named.** Leave out names, emails, places and anything else that would tell who asked. A question that cannot be copied without saying who asked is left out; tell the person.
3. **Group the same question asked in different words** and say they are grouped: the grouping is inferred. Each wording stays word for word.

## Make the ideas

For each group, most asked first:

- **Asked:** how many files ask it; by which groups.
- **Answered already?** On its own site (the profile's "questions the site answers", a said line on the topic) or not.
- **Answered by a neighbour?** A neighbour's `answers` line on the same question, by name: a question a neighbour answers and the business does not is a gap worth a post.
- **Why now,** in one sentence from the lines above. Never a reason that is not in them.

Keep the five strongest: asked most, not answered yet, answered by a neighbour. Fewer is fine; never pad the list.

## Write the words files

One file for each idea, new, never over an existing one, in the shape of [words](../../spec/words.md):

```
spec 1
kind: post
state: idea
title: Do you have plant milks?
channel: website
for: Regulars
from: ideas/2026-12-02/questions.txt
=== body ===
Asked 4 times, by Regulars. Not answered on the site yet. Wattle Street Espresso answers it on its questions page.
```

- `state` is `idea`: a title and a line, nothing written.
- `title` is the question as it was asked, word for word.
- `for` only when the ledger's groups say who asked.
- The body is the why, from the list, nothing more.

## Check it

```
node <quotes-check folder>/dist/run.js --text ideas/2026-12-02/plant-milks.txt --against ideas/2026-12-02/questions.txt > ideas/2026-12-02/plant-milks.check.txt
```

Check `questions.txt` itself against the files people sent (`--against` each) first: every question there must be found word for word. Remove, never reword, what is not found. Run the checks again until each says `result: passed`. Show the ideas and the passing reports.

## Next

The person picks an idea and answers it in their own words, by recording or notes. `dfm-content:post-make` makes the post from that answer; `dfm-content:share-make` the words to share it.

## Asking

- **Ask with the question dialog** where there is one: every question and every yes. Where there is no dialog, the question is the last line of the message.
- **Ask for what is missing; never guess it.** When an answer could mean more than one thing, ask which.
