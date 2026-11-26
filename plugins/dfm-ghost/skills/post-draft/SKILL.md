---
name: post-draft
description: Put a checked words file on a Ghost site as a draft post and read it back, with a script. Never publishes. Use when a post is written and has passed dfm-content:quotes-check ("put this on Ghost as a draft", "draft it on the site") or as the last step of dfm-recipes:recording-run.
---

# post-draft

A scripted write to Ghost. The script builds the request, sends it and reads it back; Claude runs it, shows what it printed and asks for a yes. A person publishes: no skill does.

## Before it runs

- **A words file** in the shape of [words](../../../../spec/words.md): `kind: post`, `state: draft` or `approved`, a title and a body.
- **A quotes-check report that passed** for that words file, checked against the source named in its `from`, saved after the words last changed. Save it from `dfm-content:quotes-check` as printed: `node <quotes-check folder>/dist/run.js --text <words> --against <from> > <report file>`.
- **The site in settings,** added with `dfm-ghost:site-add`; its key in the keys file.

Without all three it refuses and sends nothing.

## Run

From the working folder that holds the words file (the folder quotes-check ran in: the report's paths then match):

```
node <this skill's folder>/dist/run.js --words <file> --report <file> --site <name> --settings <file> --preview
```

1. **Preview** (the default): shows exactly what would be sent (the address, the headers and the body) and sends nothing. The key is not read for a preview. Show it in full.
2. **Ask for a yes.**
3. **Go:** the same command with `--go`. It creates the post, writes a run log line, reads the post back and prints its id and a link to open it in Ghost.
4. **Read back** later with the same `--words`, `--site` and `--settings` and `--read-back --id <post id>` in place of the mode. The words file says which title and slug to expect; the report is not needed to read back:

   ```
   node <this skill's folder>/dist/run.js --words <file> --site <name> --settings <file> --read-back --id <post id>
   ```

The run log is `run-log.txt` beside the settings file unless `--run-log <file>` names another. Add `--json` for data.

| Exit code | Means |
|---|---|
| 0 | done: the post on Ghost is a draft with the title and slug sent |
| 1 | read back found a different title or slug |
| 2 | refused or failed: nothing was sent; or Ghost says the post is not a draft |

## The rules it keeps

- **Never a status.** The request never names one; Ghost makes a new post a draft. A request that names a status is refused before it is sent.
- **Always read back.** After every write the script reads the post from Ghost. Anything but `draft` fails loudly with exit code 2. Tell the person at once and give them the link it printed so they can set it back to draft.
- **The key never shows.** The script reads it from the keys file and turns it into a five minute token. The key and the token are never printed or logged.
- **A run log line** for every write.
- **Only new posts.** It never changes a post that is already on Ghost.

## Show

Show what the script printed, in full. After `--go`, give the person the link to the draft: they read it and publish it in Ghost themselves.

## Asking

- **Ask with the question dialog** where there is one: every question and every yes, with options such as "Yes, go on", "Change something" and "Stop". Where there is no dialog, the question is the last line of the message. A question in the middle of a long message is easily missed.
- **Ask for what is missing; never guess it.** When an answer could mean more than one thing, ask which.
- **Its script needs Node 24 or later.** If `node` is not found, ask the person how Node is installed (with nvm it is often only on the PATH in an interactive shell) and run the script with that Node.

## Next

Nothing: the run ends with the draft. The person opens the link, reads the draft and publishes it in Ghost themselves.
