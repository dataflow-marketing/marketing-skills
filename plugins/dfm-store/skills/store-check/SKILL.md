---
name: store-check
description: Prove each binding in settings can be read, with a script. Reads every object where settings say it is kept (a file, a Ghost member field or a rest store) and names any problem; writes nothing. Use after dfm-store:store-add, before a change to a store and when a read or write fails ("check my stores", "can dfm reach the ledger").
---

# store-check

A scripted check. It only reads. See [store](../../spec/store.md).

## Run

```
node <this skill's folder>/dist/run.js --settings <file>
```

For each binding it finds the store and reads the object: a Ghost key that works, a site new enough to have member fields, exactly one member with the email and the field on the site. It names the backups folder object-change copies into. Add `--json` for data.

| Exit code | Means |
|---|---|
| 0 | every binding can be read |
| 1 | one or more cannot: each is named |
| 2 | refused or failed: settings that do not read |

## Show

Show what it printed, in full. For each problem say what would fix it in plain words: a member to add in Ghost, a field to make in Ghost Admin, a key to add with `dfm-ghost:site-add`, a rest store's key to put in the keys file under the name settings give.

## Asking

- **Ask with the question dialog** where there is one: every question and every yes, with options such as "Yes, go on", "Change something" and "Stop". Where there is no dialog, the question is the last line of the message. A question in the middle of a long message is easily missed.
- **Ask for what is missing; never guess it.** When an answer could mean more than one thing, ask which.
- **Its script needs Node 24 or later.** If `node` is not found, ask the person how Node is installed (with nvm it is often only on the PATH in an interactive shell) and run the script with that Node.

## Next

`dfm-store:object-read` to read an object; `dfm-store:object-change` to change one.
