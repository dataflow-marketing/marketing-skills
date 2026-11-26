---
name: objects-read
description: List every object of one kind (every ledger, every profile) that settings keep, with where each one is and its version, with a script. Reads each one; writes nothing and prints no object's text. Use when someone asks what is kept and where ("which ledgers do we have", "where is every profile kept"). Also a quick look before dfm-store:object-read, object-add or object-remove.
---

# objects-read

A scripted list. It only reads. See [store](../../spec/store.md).

## Run

```
node <this skill's folder>/dist/run.js --object <kind> --settings <file>
```

For each binding of that kind in settings it reads the object where the binding says: a file, a Ghost member field or a rest store. It prints the business, where the object is, its version and how many lines it has. One that cannot be read is named with why. It never prints an object's text. An object with no binding is a file in the working folder and is not listed. Add `--json` for data.

| Exit code | Means |
|---|---|
| 0 | each one read (or none of that kind in settings) |
| 1 | one or more cannot be read: each is named |
| 2 | refused or failed: settings that do not read, no kind |

## Show

Show what it printed, in full. For each problem say what would fix it in plain words, as `dfm-store:store-check` does. The versions are for the skills that write; there is no need to explain them.

## Asking

- **Ask with the question dialog** where there is one: every question and every yes, with options such as "Yes, go on", "Change something" and "Stop". Where there is no dialog, the question is the last line of the message. A question in the middle of a long message is easily missed.
- **Ask for what is missing; never guess it.** When an answer could mean more than one thing, ask which.
- **Its script needs Node 24 or later.** If `node` is not found, ask the person how Node is installed (with nvm it is often only on the PATH in an interactive shell) and run the script with that Node.

## Next

`dfm-store:object-read` to read one of them; `dfm-store:object-add` to fill an empty one.
