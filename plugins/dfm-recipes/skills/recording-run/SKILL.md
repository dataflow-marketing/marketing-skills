---
name: recording-run
description: Turn a person's recording into a checked draft post on their Ghost site, running the dfm skills in order with a yes between each. Use when someone has recorded what a post should say ("I recorded this week's post", "make a draft from my recording").
---

# recording-run

A recipe. It does no work of its own: it runs the skills below in order. After each step, show what it did and **wait for a yes** before the next. A no stops the run where it is; nothing later runs.

It needs `dfm-content` and `dfm-ghost` installed. Work in one working folder for the whole run: the recording's transcript, the words file and the check report all live there.

## The steps

1. **Transcript.** Get a plain text transcript of the recording, such as `recordings/2026-11-28-sam.txt`. For now this is by hand: the person types it or uses a tool they already have. A transcript skill comes with `dfm-media`, which is not built yet. Show the transcript. **Yes?**

2. **`dfm-content:post-make`.** Make the words file from the transcript: polished, nothing invented, `state: draft` and `from` naming the transcript. Show the words file. **Yes?**

3. **`dfm-content:quotes-check`.** Check the words file against the transcript and save the report beside it. Anything not found is removed, never reworded. The check runs again until it says `result: passed`. Show the passing report. **Yes?**

4. **`dfm-ghost:site-add`,** only if the site is not in settings yet. Preview the settings line, then add it on a yes. The person puts the key in their keys file themselves, never in the chat. **Yes?**

5. **`dfm-ghost:post-draft`,** in three runs:
   1. `--preview`: show exactly what would be sent. **Yes?**
   2. `--go`: create the draft. It reads it back and prints the post's id and a link.
   3. `--read-back --id <post id>`: confirm the post on Ghost is still a draft with the title and slug sent.

## A person publishes

The run ends with a draft on Ghost and its link. The person opens it, reads it and publishes it themselves. No skill publishes; this recipe never asks them to let it.

## When a step fails

Stop. Show what the step printed. Fix what it names and run that step again: never skip a step or run a later one around it.
