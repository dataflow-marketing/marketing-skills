---
name: site-add
description: Add a Ghost site to dfm settings, naming its address and the variable that holds its Admin API key, never the key itself. Use when a Ghost site is not in settings yet ("add the coffee shop's Ghost site", "set up Ghost for this business") or when dfm-ghost:post-draft says a site is missing.
---

# site-add

A scripted write to settings. The script checks and writes; Claude runs it, shows what it printed and asks for a yes. It never sees, asks for or writes a key.

## What to ask the person

1. **The site's name:** lowercase with hyphens, the one used for the business everywhere, such as `coffee-shop`.
2. **Its address:** where Ghost runs, starting `https://`, such as `https://coffee-shop.example`.
3. **The name of the variable that will hold its key,** such as `COFFEE_SHOP_GHOST_ADMIN_KEY`. Never ask for the key.
4. **The settings file:** the person's one settings file, kept outside any repo they share.
5. **Only when there is no settings file yet: its time zone,** such as `Australia/Melbourne`. Weeks and days are counted in it. Pass it as `--time-zone`; the script refuses to start a settings file without one.

## Run

From the working folder:

```
node <this skill's folder>/dist/run.js --name <name> --address <https://...> --key-name <NAME> --settings <file> --preview
```

1. **Preview** (the default): shows the line it would add and writes nothing. Show it in full.
2. **Ask for a yes.**
3. **Go:** the same command with `--go`. It appends the line, writes a run log line and reads the file back.
4. **Read back** at any time with `--read-back`.

The run log is `run-log.txt` beside the settings file unless `--run-log <file>` names another. Add `--json` for data.

| Exit code | Means |
|---|---|
| 0 | done; or the site was already there |
| 1 | read back found the line missing |
| 2 | refused or failed: the address is not https://, the name or variable is not in the right form, settings already hold a different Ghost site with this name, the settings file has problems to fix first; or there is no settings file and no `--time-zone` |

## The key

The key goes in the keys file named in settings (a `keys file:` line), never in settings and never in the chat. The person adds it in their own terminal with a hidden prompt, for example:

```
read -rs KEY && printf 'COFFEE_SHOP_GHOST_ADMIN_KEY=%s\n' "$KEY" >> ~/.config/dfm/.env && unset KEY
```

They copy the key from Ghost Admin: Settings, Integrations, a custom integration, Admin API key. If the person pastes a key into the chat, tell them to make a new one in Ghost and delete that integration's old key.

## When it refuses

Show what it printed. A different site already in settings is changed by the person by hand: site-add only adds.
