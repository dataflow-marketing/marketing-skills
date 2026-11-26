---
name: site-add
description: Add a public website on any platform to dfm settings, by its address only: dfm reads it (a profile, link checks) and never writes to it: there is no key. Use when a business's site is not on a platform dfm can post to yet ("add my Squarespace site", "my site is on WordPress") or as a step of dfm-recipes:client-run.
---

# site-add

A scripted write to settings. The script checks and writes; Claude runs it, shows what it printed and asks for a yes. A public site has no key: dfm reads what anyone can read on it and never posts to it. To post drafts, a site needs its platform's own plugin (`dfm-ghost` today).

## What to ask the person

1. **The site's name:** lowercase with hyphens, the one used for the business everywhere, such as `coffee-shop`.
2. **Its address,** starting `https://`, such as `https://coffee-shop.example`.
3. **The settings file:** the person's one settings file, kept outside any repo they share. Suggest `settings.txt` in the working folder: it is plain text, never Markdown.
4. **Only when there is no settings file yet: its time zone,** such as `Australia/Melbourne`. Pass it as `--time-zone`.

## Run

From the working folder:

```
node <this skill's folder>/dist/run.js --name <name> --address <https://...> --settings <file> [--time-zone <zone>] --preview
```

1. **Preview** (the default): shows the line it would add and writes nothing. Show it in full.
2. **Ask for a yes.**
3. **Go:** the same command with `--go`. It appends the line, writes a run log line and reads the file back.
4. **Read back** at any time with `--read-back`.

| Exit code | Means |
|---|---|
| 0 | done; or the site was already there |
| 1 | read back found the line missing |
| 2 | refused or failed: an address that is not https://, a name not in the right form, a site of that name already in settings, settings with problems to fix first; or no settings file and no `--time-zone` |

## Asking

- **Ask with the question dialog** where there is one: every question and every yes, with options such as "Yes, go on", "Change something" and "Stop". Where there is no dialog, the question is the last line of the message. A question in the middle of a long message is easily missed.
- **Ask for what is missing; never guess it.** When an answer could mean more than one thing, ask which.
- **Its script needs Node 24 or later.** If `node` is not found, ask the person how Node is installed and run the script with that Node.

## Next

In `dfm-recipes:client-run`, go back to the recipe: its next step is `dfm-content:profile-make`. A public site cannot take drafts: `dfm-recipes:recording-run` needs a site on a platform with a plugin.
