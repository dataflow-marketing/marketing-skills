---
name: object-read
description: Read one object (a ledger, a profile) wherever settings keep it, with its version, with a script. Writes nothing to the store. Use when someone wants to see or edit what is kept ("show me the ledger in Ghost", "get my plan out"). Also the first step before dfm-store:object-change.
---

# object-read

A scripted read. See [store](../../spec/store.md).

## Run

```
node <this skill's folder>/dist/run.js --object <kind> --business <name> --settings <file>
```

It prints where the object is, its version and its text. With `--out <file>` it saves the text to a new file to edit instead of printing it; it never replaces a file that is there. An object with no binding is a file in the working folder. Add `--json` for data.

| Exit code | Means |
|---|---|
| 0 | read |
| 2 | refused or failed: nothing was read |

## Show

Show where it is and the text. The version is for object-change; there is no need to explain it.

## Asking

- **Ask with the question dialog** where there is one: every question and every yes, with options such as "Yes, go on", "Change something" and "Stop". Where there is no dialog, the question is the last line of the message. A question in the middle of a long message is easily missed.
- **Ask for what is missing; never guess it.** When an answer could mean more than one thing, ask which.
- **Its script needs Node 24 or later.** If `node` is not found, ask the person how Node is installed (with nvm it is often only on the PATH in an interactive shell) and run the script with that Node.

## Next

To change it: edit the saved copy, then `dfm-store:object-change` with `--from` that file.
