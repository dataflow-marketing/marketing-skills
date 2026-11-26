---
name: object-add
description: Add one object (a ledger, a profile) where settings keep it, with a script, only when that place is empty. Refuses when something is there already; that is dfm-store:object-change. Reads it back after. Use when a new ledger or profile is ready to go where it will be kept ("put this new ledger in Ghost", "start the profile in the member field"). Also the first write at the end of another skill.
---

# object-add

A scripted write into an empty place. It never replaces anything. See [store](../../spec/store.md).

## Before it runs

- **The whole text in a file,** what another skill made or the person wrote.
- **The binding in settings,** added with `dfm-store:store-add`. With no binding the object is a file in the working folder. For Ghost, the member and the field are already there: `dfm-store:store-check` proves it.

## Run

```
node <this skill's folder>/dist/run.js --object <kind> --business <name> --settings <file> --from <file> --preview
```

1. **Preview** (the default): reads the place. When it is empty (version `none`) it prints every line the add puts in (`+ `). Nothing is written. Show the lines in full.
2. **Ask for a yes.**
3. **Go:** the same command with `--go --version none`, as the preview printed (every write names the version it was shown). It reads the place again. If anything is there now, it stops and writes nothing. Otherwise it writes, writes a run log line and reads it back. An empty place has nothing to back up.
4. **Read back** later with `--read-back` in place of the mode.

The run log is `run-log.txt` beside the settings file unless `--run-log <file>` names another. Add `--json` for data.

| Exit code | Means |
|---|---|
| 0 | done |
| 1 | read back: the object is not what the file holds |
| 2 | refused or failed: something is there already; the file is empty; it is too large; the write failed |

## When something is there already

Nothing is written. Say what is there (its lines and version) and that adding would replace it. Offer `dfm-store:object-read` to see it and `dfm-store:object-change` to change it, with its own preview and yes. Never empty a place just to add into it.

## The rules it keeps

- **Only an empty place.** Someone else's object is never overwritten.
- **Always read back.** A store that kept something else fails loudly.
- **No write larger than the store holds:** 65,535 bytes for a Ghost member field.
- **The key never shows,** and the run log holds versions, never the text.
- **Ghost has no version check of its own.** The read just before the write narrows the gap to one request; it cannot close it.

## Asking

- **Ask with the question dialog** where there is one: every question and every yes, with options such as "Yes, go on", "Change something" and "Stop". Where there is no dialog, the question is the last line of the message. A question in the middle of a long message is easily missed.
- **Ask for what is missing; never guess it.** When an answer could mean more than one thing, ask which.
- **Its script needs Node 24 or later.** If `node` is not found, ask the person how Node is installed (with nvm it is often only on the PATH in an interactive shell) and run the script with that Node.

## Next

Nothing: the object is there. `dfm-store:object-read` shows it; `dfm-store:object-change` changes it later.
