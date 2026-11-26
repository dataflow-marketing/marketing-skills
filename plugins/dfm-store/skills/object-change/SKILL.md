---
name: object-change
description: Change one object (a ledger, a profile) wherever settings keep it, with a script, only if no one else has changed it since it was read. Backs it up first and reads it back after. Use when a changed ledger or profile is ready to go where it is kept ("put this in Ghost", "save the plan to the member"). Also the write at the end of another skill.
---

# object-change

A scripted write. The store never merges: when the object has changed since it was read, it stops. See [store](../../spec/store.md).

## Before it runs

- **The whole new text in a file,** such as a copy saved with `dfm-store:object-read --out` and then edited. Or what another skill made.
- **The binding in settings,** added with `dfm-store:store-add`. With no binding the object is a file in the working folder.

## Run

```
node <this skill's folder>/dist/run.js --object <kind> --business <name> --settings <file> --from <file> --preview
```

1. **Preview** (the default): reads the object and prints the lines the change takes out (`- `) and puts in (`+ `) with its version. Nothing is written. Show the lines in full.
2. **Ask for a yes.**
3. **Go:** the same command with `--go --version <version>`, the version the preview printed. It reads the object again. If it has changed since the preview, it stops and writes nothing. Otherwise it copies the object into the backups folder, writes, writes a run log line and reads it back.
4. **Read back** later with `--read-back` in place of the mode.

The run log is `run-log.txt` beside the settings file unless `--run-log <file>` names another. Add `--json` for data.

| Exit code | Means |
|---|---|
| 0 | done (or nothing to change) |
| 1 | read back: the object is not what the file holds |
| 2 | refused or failed: it changed since it was read; it is too large; the write failed |

## When it has changed since it was read

The script prints the change as it would be from the object as it is now. Someone else's edit is never overwritten. Tell the person who or what may have changed it if you can tell, then work the change into the object as it is now (`dfm-store:object-read --out` a fresh copy) and preview again. Never run `--go` with a version that was not the one just previewed.

## The rules it keeps

- **A backup before every change,** in the backups folder (`backups:` in settings; by default `backups/` beside the settings file). Backups are never cleared by a skill.
- **Always read back.** A store that kept something else fails loudly and names the backup.
- **No write larger than the store holds:** 65,535 bytes for a Ghost member field; what a rest store declares at `/limits`.
- **The key never shows,** and the run log holds versions, never the text.
- **Ghost has no version check of its own.** The read just before the write narrows the gap to one request; it cannot close it.
- **A rest store closes the gap.** The write carries the version in `If-Match`; a store that has moved answers `409`, nothing is written and the script shows the object as it is now, as above. The version shown is the store's own.

## Asking

- **Ask with the question dialog** where there is one: every question and every yes, with options such as "Yes, go on", "Change something" and "Stop". Where there is no dialog, the question is the last line of the message. A question in the middle of a long message is easily missed.
- **Ask for what is missing; never guess it.** When an answer could mean more than one thing, ask which.
- **Its script needs Node 24 or later.** If `node` is not found, ask the person how Node is installed (with nvm it is often only on the PATH in an interactive shell) and run the script with that Node.

## Next

Nothing: the change is done. `dfm-store:object-read` shows it.
