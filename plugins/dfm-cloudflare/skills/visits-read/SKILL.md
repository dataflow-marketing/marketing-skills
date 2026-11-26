---
name: visits-read
description: Read a week's site numbers from Cloudflare Web Analytics (visits, page views and visits from another site) for every fact in a ledger whose source is cloudflare, with a script. Reads only: dfm-ledger:counts-record records the numbers on a yes. Use when someone asks for their site's visits for a week ("how many visits this week", "get the Cloudflare numbers") and in step 2 of dfm-recipes:week-run.
---

# visits-read

A scripted read. The script asks Cloudflare and adds up; Claude runs it and shows what it printed. It writes nothing: the numbers go to `dfm-ledger:counts-record`, which previews them and writes them on a yes.

## Which facts

Every fact in the ledger's graph whose source starts with `cloudflare <host> <measure>`:

```
fact site visits: cloudflare coffee-shop.example visits
fact pages viewed: cloudflare coffee-shop.example views
fact found the site: cloudflare coffee-shop.example outside
```

| Measure | Counts |
|---|---|
| `visits` | Cloudflare's visits: a page view that came from another site or from nowhere |
| `views` | page views |
| `outside` | page views whose referer is another site: people who found the site |

A host is counted with and without `www`. Ghost's admin (`/ghost/...`) and draft previews (`/p/...`) are never visitors and are always left out.

## The week

From the week's Monday at 00:00 in the settings' time zone to the next Monday at 00:00. This week ends now. Cloudflare keeps older weeks at lower detail: a number it sampled is marked `estimated`. Read each week soon after it ends.

## Run

From the working folder:

```
node <this skill's folder>/dist/run.js --ledger ledger.txt --settings settings.txt [--week <Monday>]
```

Show what it printed in full. It ends with the `dfm-ledger:counts-record` line that records the numbers. `--json` gives the same as data, with `countArgs` ready to pass on.

| Exit code | Means |
|---|---|
| 0 | read (or no fact comes from Cloudflare: nothing to read) |
| 2 | refused or failed: no Cloudflare line in settings for a host, no keys file or no key, a measure Cloudflare does not count, a week not begun, Cloudflare refused |

## Settings

Each host needs one line in settings. Settings name the account and the key's variable, never the key:

```
site coffee-shop: cloudflare coffee-shop.example account <account id> key in CLOUDFLARE_API_TOKEN
keys file: ~/.config/dfm/.env
```

When the script says a line is missing, ask the person, each in the question dialog, for:

1. **The account id.** In the Cloudflare dashboard: the account's home page, Account ID (also in the address bar after `dash.cloudflare.com/`). It is not a secret.
2. **The keys file,** only when settings have no `keys file:` line. Suggest `~/.config/dfm/.env`.
3. **The key's variable.** First list the names already in the keys file, never their values: `grep -o '^[A-Za-z_][A-Za-z0-9_]*=' <keys file>`. Offer any name with `CLOUDFLARE` in it first: the person may have a token already. Suggest `CLOUDFLARE_API_TOKEN` only when there is none. The person then adds the token (below).

Show the lines and add them to settings on a yes. A `dfm-cloudflare:site-add` script is on the road map; until then the line is added as shown.

## The key

A Cloudflare API token with one permission: **Account, Account Analytics, Read**. The person makes it in the dashboard (My Profile, API Tokens, Create Token, Custom token) and adds it in their own terminal with a hidden prompt, never in the chat:

```
read -rs KEY && printf 'CLOUDFLARE_API_TOKEN=%s\n' "$KEY" >> ~/.config/dfm/.env && unset KEY
```

If the keys file is new, they make it readable only by them first:

```
mkdir -p ~/.config/dfm && touch ~/.config/dfm/.env && chmod 600 ~/.config/dfm/.env
```

If the person pastes a token into the chat, tell them to roll it in the dashboard.

## Asking

- **Ask with the question dialog** where there is one: every question and every yes, with options such as "Yes, go on", "Change something" and "Stop". Where there is no dialog, the question is the last line of the message. A question in the middle of a long message is easily missed.
- **Ask for what is missing; never guess it.** When an answer could mean more than one thing, ask which.
- **Its script needs Node 24 or later.** If `node` is not found, ask the person how Node is installed and run the script with that Node.

## Next

`dfm-ledger:counts-record` with the `--count` line it printed, after the person's yes. In `dfm-recipes:week-run` that is part of step 2.
