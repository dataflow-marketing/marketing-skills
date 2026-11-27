# Market ledger (spec 1, draft)

A [ledger](ledger.md) read from the outside: what a business says on its own site, read after read. It has the ledger's four parts and the ledger's words. A business's own ledger is told from the inside: what it plans and counts. A market ledger is read off its site: its plan is worked out from what it did. Kept for the neighbours in a market. Also for the business itself: its own market ledger beside its ledger shows what it does that its site never says. The [profile](profile.md) stays for how a business speaks.

Each word is marked as in the ledger: **in use** (the ledger's word, meaning the same), **new** or **to settle**.

## Rules

The ledger's six rules hold, with these for reading from the outside:

1. **Every line says where it came from:** its page in brackets or its link.
2. **Their words in quotes,** word for word: quotes-check can then prove every line.
3. **Only what their own site says.** No search, no reviews elsewhere, no guessing. A business profiled, never a private person: named people stay on their site.
4. **Observed or inferred, on every graph line.** Read off the site is `(observed)`. Sorting their words into a claim or a proof is `(inferred)`; so is a date worked out from their words. Every plan line is inferred: the part is worked out, never told.
5. **Never a want.** What a business wants cannot be read off its site. Its plan is only what it is expected to do: want, expect and happened never mix.
6. **Never a cause.** What changed, never why.

## The shape

```
spec 1
=== graph ===
=== plan ===
=== done ===
=== summary ===
```

## Graph: what stands on its site now

No dates: the graph is the business as its site shows it at the last read. When a read finds something changed, the graph line changes and the done part keeps what it was.

| Word | Example | Says | Status |
|---|---|---|---|
| **business** | `business the-long-table: a sit down brunch cafe` | its name in settings and what it is | in use |
| **site** | `site http://localhost:4102 (sitemap)` | where it is read and how | new |
| **own** | `own` | this is the business's own site, kept beside its ledger | new |
| **fact** | `fact posts: the site's sitemap (observed)` | a count read at every read: `pages`, `posts` | in use |
| **opens** | `opens every day: 7.30 to 3.00 [/contact/] (observed)` | the hours it gives | new |
| **offer** | `offer kids meal: "Every kids meal is 12 dollars and comes with a babyccino" [/questions/] (observed)` | what it offers, named, then its words | in use |
| **until** | `offer Christmas cakes: "Orders close on 15 December" [/news/christmas-cake-orders-open/] until 2026-12-15 (inferred)` | the day an offer ends, when its words give one | new |
| **claim** | `claim "room for everyone": proof on the site [/] (inferred)` | something it says of itself a reader cannot check from the page, then `proof on the site` or `no proof on the site`, never other words | new |
| **proof** | `proof customers: "The best pancakes on this side of town ..." [/about/] (observed)` | what lets a reader check: an award named, a supplier named, customers' words | new |
| **answers** | `answers "Can I bring my dog?" [/questions/] (observed)` | a question its site answers, in its words | new |
| **channel** | `channel Instagram: "Follow us on Instagram" [/] (observed)` | where else it says it speaks | in use |

**A name** after `opens`, `offer`, `claim` or `proof` is how a change finds its line. Names are the reader's, short and plain; the words after the colon are the business's own. On a business's own market ledger, an offer and a channel have the names they have in its ledger: that is how the two are matched.

**Prices** in an offer are **to settle**: the business's own ledger keeps no money (its rule 6). A public price copied from a site is what moves most often in a market.

## Plan: what it is expected to do

Worked out from its posts, never told. Only a rhythm that has held is written; a business with none has no plan part. That is a finding.

| Word | Example | Says | Status |
|---|---|---|---|
| **every** | `every week this week's special from 2026-11-02` | a step it repeats, in the ledger's words; the step's name is found in the titles of its posts; `a post` is any post | in use (`every month` and `every 2 weeks` are to settle) |
| **on** | `on 2026-12-24 to 2027-01-01: "We are closed from 24 December and open again on 2 January" [/news/closed-for-christmas/]` | a dated happening it tells of, such as a closure; its weeks are left out when a step is counted | in use (the range is new) |

**How sure:** each post ticks the plan's steps in the week it was published, as a member ticks theirs (see Done). The summary counts the ticks and gives the ledger's strength words: a step done 3 times is `assumed`; done in 6 or more weeks with none missed, `believed`. Weeks inside an `on` are left out. A week with no tick is a step not done: a change in the market, found by a count, never by eye.

## Done: what each read found

Every line is keyed by a Monday, as in the ledger. A read and what it found changed: the Monday of the week of the read, its own day on its `read` line. A post and the steps it ticks: the Monday of the week it was published. Written by code where it can be: the read, its counts, its posts and the ticks. The rest by a model, checked.

| Word | Example | Says | Status |
|---|---|---|---|
| **read** | `2026-12-07 read on 2026-12-09` | a read happened and on which day; written every read, even when nothing changed | new |
| **fact total** | `2026-12-07 fact total posts: 6` | a count on the day of the read | in use |
| **said** | `2026-12-07 said on site on 2026-12-07: "This week's special: French toast" http://localhost:4102/news/this-weeks-special-french-toast/ [everyone] summary: "Brioche French toast with poached pears, all week until Sunday."` | a post: the day it was published, its title and link, for everyone, its first sentence as its summary; the ledger's said line exactly; written once, by the read that first finds it | in use |
| **done** | `2026-12-07 this week's special: done` | a plan step ticked by a post in that week | in use |
| **was** | `2026-12-07 was offer kids meal: "Every kids meal is 10 dollars and comes with a babyccino" [/questions/]` | a graph line as it stood before this read changed it | new |
| **gone** | `2027-01-04 gone answers "Do you take cards?" [/questions/]` | a graph line no longer on the site | new |
| **new** | `2027-01-04 new claim "Voted the best coffee on Wattle Street"` | a graph or plan line first seen at this read, by its word and name; a new `on` by its words and page, never by the dates worked out from them | new |

The first read writes the graph and the plan, then `read`, its `fact total` lines, a `said` line for every post and its ticks. Each later read writes `read`, its counts, said lines and ticks for new posts, then `new`, `was` and `gone` for every graph or plan line that changed.

## Summary

Written by a script from the three parts above, never by hand, as in the ledger. What an AI reads first:

```
=== summary ===
as at 2027-01-04, read 3 times from 2026-11-23 (calculated)
posts: 9, from 2026-11-02 to 2027-01-04 (calculated)
every week a post: done 9 of 9 weeks, the week of 2026-12-28 inside its closure, believed (calculated)
every week this week's special: done 7 of 9 weeks, not in the weeks of 2026-11-09 and 2026-12-21, assumed (calculated)
changed since the first read: offer kids meal, was "10 dollars", now "12 dollars" (calculated)
claims with no proof: none (calculated)
```

## Inside and outside

With a business's own market ledger beside its ledger, a script lists what one says and the other does not, never which is right:

- an `offer` or `channel` in its ledger's graph with none of the same name in its market ledger: it does it, its site does not say so
- an `offer` in its market ledger with none of the same name in its ledger: its site says it, its plan does not know it
- a step in its ledger's plan beside the same step inferred from its site: what it plans against what its site shows it did

## Kept

One market ledger for each business: a file `market-<business>.txt` beside the market's settings. Or an object of kind `market` in a store (see [store](store.md)) with the business's name as its id. When done grows large, old reads move into its history, as weeks do in the ledger.

## Checked

`dfm-content:quotes-check` on the graph and done parts, against the pages of every read, the read dates and the dates worked out: each Monday with the day it is for, each date worked out from words with the words and the post it came from. A person reads that list. The plan and summary are worked out from the graph and done by code, which its tests prove; their counts are on no page. A person reads it all: the check cannot tell a claim from a proof.
