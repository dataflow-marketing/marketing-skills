---
name: recording-run
description: Turn a person's recording into a checked draft post on their Ghost site, running the dfm skills in order with a yes between each. Use when someone has recorded what a post should say ("I recorded this week's post", "make a draft from my recording"). Also where someone new to dfm starts.
---

# recording-run

A recipe. It does no work of its own: it runs the skills below in order. After each step, show what it did and **wait for a yes** before the next. A no stops the run where it is; nothing later runs.

It needs `dfm-content` and `dfm-ghost` installed. Work in one working folder for the whole run: the recording's transcript, the words file and the check report all live there.

## The steps

1. **Transcript.** Get a plain text transcript of the recording, such as `recordings/2026-11-28-sam.txt`. For now this is by hand: the person types it or uses a tool they already have. A transcript skill comes with `dfm-media`, which is not built yet. Show the transcript and ask whether anything was misheard: a transcript often mishears a word. Fix it with the person's own words before going on, never by guessing. **Yes?**

2. **`dfm-content:post-make`,** which checks its own words with `dfm-content:quotes-check` and saves the passing report beside the words file. Show the words file and the report. **Yes?**

3. **`dfm-ghost:site-add`,** only if the site is not in settings yet. Preview the settings lines, then add them on a yes. The person puts the key in their keys file themselves, never in the chat. **Yes?**

4. **`dfm-ghost:post-draft`,** in three runs:
   1. `--preview`: show exactly what would be sent. **Yes?**
   2. `--go`: create the draft. It reads it back and prints the post's id and a link.
   3. `--read-back --id <post id>` with the same `--words`, `--site` and `--settings` (no report): confirm the post on Ghost is still a draft with the title and slug sent.

## A person publishes

The run ends with a draft on Ghost and its link. The person opens it, reads it and publishes it themselves. No skill publishes; this recipe never asks them to let it.

## When a step fails

Stop. Show what the step printed. Fix what it names and run that step again: never skip a step or run a later one around it.

## Asking

- **Ask with the question dialog** where there is one: every question and every yes, with options such as "Yes, go on", "Change something" and "Stop". Where there is no dialog, the question is the last line of the message. A question in the middle of a long message is easily missed.
- **Ask for what is missing; never guess it.** When an answer could mean more than one thing, ask which.
- **Say which step this is** at the start of each message: "Step 2 of 4: post-make".
