---
name: object-remove
description: Empty one object (a ledger, a profile) wherever settings keep it, with a script: a file is removed, a Ghost member field is set to empty. Only if no one has changed it since it was read, always with a backup first, only on an explicit yes, read back after. Use when someone wants an object gone ("clear the ledger in Ghost", "remove the old profile"). Never to make room for an add: that is dfm-store:object-change.
---

# object-remove

A scripted remove. Nothing is lost: a copy goes into the backups folder first, every time. See [store](../../spec/store.md).

## Run

```
node <this skill's folder>/dist/run.js --object <kind> --business <name> --settings <file> --preview
```

1. **Preview** (the default): reads the object and prints every line the remove takes out (`- `) with its version. Nothing is removed. Show the lines in full.
2. **Ask for an explicit yes** to removing this object, naming it and where it is. A yes to something else (a change, a plan) is not a yes to a remove.
3. **Go:** the same command with `--go --version <version>`, the version the preview printed. It reads the object again. If it has changed since the preview, it stops and removes nothing. Otherwise it copies the object into the backups folder, removes it (a file is deleted; a Ghost field is set to null, every other field kept), writes a run log line and reads it back.
4. **Read back** later with `--read-back` in place of the mode: 0 when it is empty.

The run log is `run-log.txt` beside the settings file unless `--run-log <file>` names another. Add `--json` for data.

| Exit code | Means |
|---|---|
| 0 | done (or nothing to remove: it was empty) |
| 1 | read back: the object is still there |
| 2 | refused or failed: it changed since it was read; no version; the remove failed |

## When it has changed since it was read

The script prints the object as it is now and removes nothing. Someone else's edit is never removed without being seen. Show it, say who or what may have changed it if you can tell and ask again whether to remove it as it is now. If yes, preview again. Never run `--go` with a version that was not the one just previewed.

## The rules it keeps

- **A backup before every remove,** in the backups folder (`backups:` in settings; by default `backups/` beside the settings file). Backups are never cleared by a skill. Say where the backup is after the remove.
- **Always read back.** An object still there fails loudly and names the backup.
- **The key never shows,** and the run log holds versions, never the text.
- **Ghost has no version check of its own.** The read just before the remove narrows the gap to one request; it cannot close it.

## Asking

- **Ask with the question dialog** where there is one: every question and every yes, with options such as "Yes, go on", "Change something" and "Stop". Where there is no dialog, the question is the last line of the message. A question in the middle of a long message is easily missed.
- **Ask for what is missing; never guess it.** When an answer could mean more than one thing, ask which.
- **Its script needs Node 24 or later.** If `node` is not found, ask the person how Node is installed (with nvm it is often only on the PATH in an interactive shell) and run the script with that Node.

## Next

Nothing: the object is empty. To put it back, `dfm-store:object-add` with `--from` the backup file.
