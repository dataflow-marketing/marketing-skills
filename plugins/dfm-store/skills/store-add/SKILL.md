---
name: store-add
description: Name where a business's objects are kept, with a script. Adds a store (a folder of files or a Ghost site's member fields) and a binding (which store keeps which object, such as the ledger) to settings. Use when someone wants their ledger or profile kept in Ghost or in a folder ("keep my ledger in Ghost", "store the plan on the member") or before dfm-store:object-change writes somewhere new.
---

# store-add

A scripted write to settings. It names a store, a binding or both; it never reads or writes an object. See [store](../../spec/store.md) and [settings](../../spec/settings.md).

## Before it runs

- **A settings file,** started by adding a site: `dfm-ghost:site-add` or `dfm-site:site-add`.
- **For a Ghost store, the Ghost site in settings** with its key, added with `dfm-ghost:site-add`.
- **For a Ghost binding, the member's email and the field's name.** The field must already be a custom member field on the site (Ghost Admin, Settings, Members). Ask for both; never guess an email.

With no binding an object stays a file in the working folder. Nothing that works today needs a store.

## Run

```
node <this skill's folder>/dist/run.js --store <name> --settings <file> --connector ghost --where <site> --object ledger --business <name> --place "<email> <field>" --preview
```

- **A store alone:** `--connector file --where <folder>` or `--connector ghost --where <site name>`.
- **A binding alone,** to a store already listed: `--object`, `--business` and `--place`. For a file store the place is a path inside its folder.

1. **Preview** (the default): shows the lines it would add and writes nothing. Show them.
2. **Ask for a yes.**
3. **Go:** the same command with `--go`. It appends the lines, writes a run log line and reads settings back.

| Exit code | Means |
|---|---|
| 0 | done (or the lines were already there) |
| 1 | read back found a problem |
| 2 | refused or failed: nothing was written |

## The rules it keeps

- **Adding, never changing.** A different store of the same name is refused. So is an object already bound somewhere else. Moving an object is a job of its own.
- **The rest connector is refused** until it is built.
- **Settings must read cleanly** before and after.

## Asking

- **Ask with the question dialog** where there is one: every question and every yes, with options such as "Yes, go on", "Change something" and "Stop". Where there is no dialog, the question is the last line of the message. A question in the middle of a long message is easily missed.
- **Ask for what is missing; never guess it.** When an answer could mean more than one thing, ask which.
- **Its script needs Node 24 or later.** If `node` is not found, ask the person how Node is installed (with nvm it is often only on the PATH in an interactive shell) and run the script with that Node.

## Next

`dfm-store:store-check` proves each binding can be read.
