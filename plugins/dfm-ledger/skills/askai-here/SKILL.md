---
name: askai-here
description: Answer the Ask an AI copy here, in this session, instead of pasting it into another AI chat: the same instructions, the same rounds with the person, ending in Change lines that go straight to plan-change. Use when someone wants help with their plan without leaving ("answer it here", "help me with my plan now", "do the ask AI here").
---

# askai-here

A guided skill with no script of its own. The copy from `dfm-ledger:askai-make` is the brief; Claude follows it with the person, exactly as another AI chat would. Nothing here changes the plan: the changes go to `dfm-ledger:plan-change`, which shows them first and writes only on a yes.

## Make the copy

Run `dfm-ledger:askai-make` as its SKILL.md says, with `--out` to a new file named with today's date. **Always make a fresh copy,** even when an earlier one is there: an old copy carries an old summary. For where the response is sent, use "this session". Ask the person which instructions to use (the default or a template of their own) as askai-make does.

## Follow it, as written

1. **Read all of the copy.** Its first part (`=== read this first ===`) is the brief: follow every rule in it, as if the person had pasted it into a new chat. The rules there come before what you would do by habit.
2. **Forget what you know of this person** from the rest of this session for the length of it. Their website and their plan come from the copy only; a fact from elsewhere is not in the copy and is not used.
3. **Numbered choices go in the question dialog,** one round at a time, each option labelled as the brief writes it. Where the brief asks an open question (the person's own words), ask it as one, never with drafted options.
4. **Count the rounds** exactly as the brief says: no round number on the first reply, then `Round 2 of 7` and on, at the start of each question.
5. **The end:** write the response the brief asks for with its `Change:` lines, then save it as a new file in the working folder (such as `ai-response.txt`), never over one. Show it in full.

## Never

- Never write a step's words, a post or a how line for the person: they say them and you polish, as the brief says.
- Never change `ledger.txt` yourself. Every change goes through `dfm-ledger:plan-change`.
- Never make up a rate or a number: not counted is not zero.

## Asking

- **Ask with the question dialog** where there is one: every question and every yes, with options such as "Yes, go on", "Change something" and "Stop". Where there is no dialog, the question is the last line of the message. A question in the middle of a long message is easily missed.
- **Ask for what is missing; never guess it.** When an answer could mean more than one thing, ask which.

## Next

Ask whether to put the changes in the plan now. On a yes, run `dfm-ledger:plan-change` with `--changes ai-response.txt`: it previews each line and writes only on a further yes.
