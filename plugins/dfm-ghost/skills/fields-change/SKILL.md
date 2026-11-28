---
name: fields-change
description: Change one custom field for one member on a Ghost site, such as their answer to an account question: the field as Ghost defines it (a pick list takes only its own choices, word for word), a preview first, then on a yes a write only if no one changed it since, with a backup before and a read back after. A field that holds a ledger is refused. Use when a member's answer should change ("she said they are on LinkedIn now", "set his business kind") or as a step of dfm-ledger:inbox-read.
---

# fields-change

A scripted write. The script checks the value against the field, previews, writes on a yes and reads back; Claude runs it and never changes a member any other way.

## Run

```
node <this skill's folder>/dist/run.js --site <name> --email <member> --field <key> --value "<value>" --settings <file>
```

1. **Preview** (the default): the field and its question, what it holds now, what it would hold and its version. Show it in full and ask: **change it?**
2. On a yes: the same command with `--go --version <the version the preview printed>`. If the field changed since the preview, nothing is written: preview it again.
3. `--read-back` checks later that the field holds the value.

| Exit code | Means |
|---|---|
| 0 | done (or no change: it already holds this) |
| 1 | read back differs from what was sent |
| 2 | refused or failed: no such field, not a choice, no such member or more than one, a field that holds a ledger |

## The value

- **A pick list** takes only its own choices, word for word: `--value "Google"`; where more than one may be picked, `--value "Google | LinkedIn"`. Choose the choice that matches what the member said; when none matches, use the notes question in their own words; otherwise ask.
- **A text field** takes their words.
- **An empty value** (`--value ""`) clears the field.

## What it never does

- **Never changes a field that holds a ledger** (a binding in settings, such as `next`): that is `dfm-store:object-change`, with its own version check.
- **Never changes more than the one field:** every other field and the rest of the member stay as they are.
- **Never prints the key:** it goes from the keys file into the token and nowhere else.

Before every write it keeps a backup of what the field held, in the settings' backups folder. It logs the change in the run log by the member's id, never their email.

## Asking

- **Ask with the question dialog** where there is one: every question and every yes. Where there is no dialog, the question is the last line of the message.
- **Ask for what is missing; never guess it.** When an answer could mean more than one thing, ask which.
- **Its script needs Node 24 or later.** If `node` is not found, ask the person how Node is installed and run the script with that Node.
