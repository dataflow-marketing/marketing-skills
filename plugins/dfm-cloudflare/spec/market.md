# Reading a business from outside (spec 1, draft)

How a business's site is read into a [ledger](ledger.md): what anyone can see there, read after read. The words are the ledger's own; this page says how they are used when a site is read from outside. A neighbour in a market gets a ledger with only outside lines. The business itself gets its outside lines beside the ones it tells us: its site as the public sees it. The [profile](profile.md) stays for how a business speaks.

`dfm-content:market-read` does it: code writes what it can be sure of, a model writes the rest, `dfm-content:quotes-check` proves it.

## Rules

The ledger's rules hold, with these for reading from outside:

1. **Only what its own site says.** No search, no reviews elsewhere, no guessing. A business profiled, never a private person: named people stay on their site.
2. **Every line `(observed)` or `(inferred)`.** Read off the site is observed. Sorting its words into a claim or a proof is inferred; so are a date worked out from its words and every plan line. Never `(stated)`: no one told us.
3. **Its words in quotes,** word for word, with its page in brackets: quotes-check can then prove every line.
4. **Never a want.** What a business wants cannot be read off its site. Its plan is only what it is expected to do.
5. **Never a cause.** What changed, never why.

## A read

Every line in done is keyed by a Monday. A read and what it found changed: the Monday of the week of the read, its own day on its `read` line. A post and the steps it ticks: the Monday of the week it was published.

**The first read** writes the graph (`business`, `site`, the `fact` lines for `pages` and `posts`, then what its site shows: `opens`, `offer`, `claim`, `proof`, `answers`, `channel`), the plan, then in done: `read`, its `fact total` lines, a `said` line for every post and its ticks.

**Each later read** writes `read`, its counts, a said line for each new post and its ticks, then `new`, `was` and `gone` for every graph or plan line that changed. The graph is then changed to what the site shows now. A new `on` is named by its words and page, never by the dates worked out from them.

**Code writes** the read line, the counts, the said lines (the post's own first sentence as its summary, `[everyone]` as who it was for), the ticks and the summary. **A model writes** the graph, the plan and what changed, only from the read's pages.

## The plan, worked out

Only a rhythm a business's posts show 3 or more times is written, in the ledger's words: `every week this week's special from 2026-11-02 (inferred)`. The step's name is found in the titles of its posts; `a post` is any post. A business with none has no plan: that is a finding. A closure it tells of is an `on` line; its weeks are left out when a step is counted.

**How sure:** the summary counts the ticks and gives the ledger's strength words: a step done 3 times is `assumed`; done in 6 or more periods with none missed, `believed`. A period with no tick is a step not done: a change in the market, found by a count, never by eye. The period of the last read is counted only once it is done.

## The summary, from outside

```
=== summary ===
as at 2027-01-04, read 3 times from 2026-11-23 (calculated)
posts: 9, published from 2026-11-02 to 2027-01-04 (calculated)
every week a post: done 9 of 9 weeks, the week of 2026-12-28 inside a closure, believed (calculated)
every week this week's special: done 7 of 9 weeks, not in the weeks of 2026-11-09 and 2026-12-21, assumed (calculated)
changed at the last read: 2027-01-04 new on: "We are closed from 24 December and open again on 2 January" (calculated)
claims with no proof: none (calculated)
```

Also `changed at earlier reads`, `offers ended` (an offer past its `until`) and, with no plan, `plan: none worked out`.

## Inside and outside

A business's own lines from both sides are matched by name. A script lists what one side says and the other does not, never which is right:

- an `offer` or `channel` stated with no observed line of the same name: it does it, its site does not say so
- an `offer` observed with no stated line of the same name: its site says it, its plan does not know it
- a stated step beside an inferred one: what it plans against what its site shows it did

Until the readers take outside words in a ledger a live page reads, a business's outside lines are kept in a file of their own beside its ledger (`market-<business>.txt`) and the check reads the two.

## Taken to an AI

`dfm-ledger:askai-make` with [ask-ai-outside-instructions.txt](ask-ai-outside-instructions.txt): the AI is told the ledger is a site read from outside, who is asking and that a claim with no proof is never called false. Its ideas come back as changes to the asker's own plan, never to this ledger.

## Kept

A neighbour's ledger: a file `market-<business>.txt` in the market's folder. Or an object of kind `market` in a store (see [store](store.md)) with the business's name as its id. When done grows large, old reads move into its history, as weeks do.

**Prices** in an offer are **to settle**: the ledger keeps no money (its rule 6). A public price copied from a site is what moves most often in a market.

## Checked

`dfm-content:quotes-check` on the graph and done parts, against the pages of every read and the dates worked out: each Monday with the day it is for, each date worked out from words with the words and the post it came from. A person reads that list. The plan and summary are worked out by code, which its tests prove; their counts are on no page. A person reads it all: the check cannot tell a claim from a proof.
