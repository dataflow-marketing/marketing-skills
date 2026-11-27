# Market ledger (spec 1, draft)

What one other business in a market says about itself on its own site, read after read, one record per line. A business's [ledger](ledger.md) keeps its own marketing; a market ledger keeps what it can see of a neighbour's. The [profile](profile.md) stays for how a business speaks; the market ledger is what it says it does, in short lines an AI can take in at once.

Each word below is marked as in the ledger: **in use**, **new** or **to settle**. Everything here is new.

## Rules

1. **Plain text, one record per line.** Every line is dated by the read it was seen on.
2. **Every line says where it came from:** the page, in brackets, after it. Every line is observed: it was read off the site.
3. **Their words in quotes,** word for word: quotes-check can then prove every line.
4. **Only what their own site says.** No search, no reviews elsewhere, no guessing. A business profiled, never a private person: named people stay on their site.
5. **Unknown is not zero.** A business with no `opens` line has not said its hours; it is not closed. "No proof on the site" is a finding, written as one.
6. **Never a cause.** What changed, never why.

## The shape

```
spec 1
=== business ===
=== seen ===
=== now ===
```

**Now** is written by a script from seen, never by hand: every line still standing after the last read.

## Business: whose ledger it is

| Word | Example | Says |
|---|---|---|
| **business** | `business wattle-street-espresso: a takeaway window` | its name in settings and what it is, in a line |
| **site** | `site http://localhost:4104 (sitemap)` | where it was read and how |

## Seen: what each read found

The first read writes every line. Each later read writes its `read` line, then only `+` for what came and `-` for what went. A thing that changed is a `-` then a `+`.

| Word | Example | Says |
|---|---|---|
| **read** | `2026-12-09 read: 3 pages, 3 posts` | a read happened and what it counted; written every read, even when nothing changed |
| **opens** | `2026-11-27 opens Monday to Friday: 6.30 to 2.00 [/]` | the hours it gives, as it gives them |
| **offer** | `2026-11-27 offer stamp card: "your tenth coffee is free" [/]` | what it offers, named, then its words |
| **claim** | `2026-11-27 claim "award-winning": no proof on the site [/]` | something it says of itself a reader cannot check from the page, then whether the site proves it |
| **proof** | `2026-11-27 proof award: "First prize, sourdough, Wattle Shire Show 2025" [/about/]` | what lets a reader check: an award named, a supplier named, customers' words |
| **answers** | `2026-11-27 answers "Do you have plant milks?" [/questions/]` | a question its site answers, in its words |
| **channel** | `2026-11-27 channel Instagram: "Follow us on Instagram" [/]` | where else it says it speaks |
| **said** | `2026-11-27 said on site on 2026-11-03: "November's guest coffee" [/news/novembers-guest-coffee/]` | a post and the day it was published, as the business's ledger writes what went out |
| **+** and **-** | `2026-12-09 - offer plant milk` then `2026-12-09 + offer plant milk: "at no extra charge" [/questions/]` | what came and went since the read before; a `-` names the line it takes off by its word and name |

**A claim's proof is one of two fixed words:** `no proof on the site` or `proof on the site`, never free text: a script can then find every claim with no proof. The proof itself is its own `proof` line.

**A name** after `offer`, `opens`, `proof` or `claim` is what a `-` takes off: `- offer plant milk`, `- claim "specialty"`. Names are the reader's, short and plain; the words after the colon are the business's own.

**Prices** in an offer (`offer country sourdough: "9 dollars"`) are **to settle**: the business's own ledger keeps no money (its rule 6). A public price copied from a neighbour's site is what moves most often in a market.

## Now: the latest of each line

```
=== now ===
as at 2027-01-05, read 3 times from 2026-11-27
opens Monday to Friday: 6.30 to 2.00 [/]
claim "voted the best coffee on Wattle Street": no proof on the site [/] (since 2027-01-05)
...
```

Each line as seen, without its date, with `(since <date>)` when it came after the first read. An AI reads only this part for what a business does today; seen says what moved.

## Kept

One market ledger for each other business: a file `market-<business>.txt` beside the market's settings. Or an object of kind `market` in a store (see [store](store.md)) with the business's name as its id.

## Checked

`dfm-content:quotes-check` against each read's pages and a file of the read dates: every quote, name and number on every line found. A person reads it: the check cannot tell a claim from a proof.
