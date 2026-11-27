# Ledger (spec 1, draft)

A ledger keeps the context of one business's marketing: how it works, what it plans to do, what happened and a summary. It is written so a person can read it aloud and an AI can work from it without inventing anything.

One ledger holds a business seen from both sides: from the inside, what the person tells us and their platforms count; from the outside, what its own site shows anyone. Every line says which. A neighbour in a market has a ledger in the same format with only outside lines: [reading a business from outside](market.md) says how one is read.

Each word below is marked:

- **in use:** used every day in dfm on real businesses since November 2026
- **new:** added in spec 1, not yet used on a real business
- **to settle:** needed, its exact wording not settled

## Rules

1. **Plain text, one record per line.** A line that happened or will happen is dated. The graph has no dates: it is how things work.
2. **Every line says where it came from:** its source word last, in brackets (see [the source words](#where-a-number-came-from-and-how-sure-it-is)). A number also says how sure it is.
3. **Groups, not individuals.** Named people stay in the business's own systems.
4. **The business's own words for things.**
5. **Want, expect and happened never mix.**
6. **No money.** A goal is a count of actions a week, never revenue.
7. **Easy to grep.** The word comes first: at the start of a graph or plan line, after the Monday in done (and after `new`, `was` or `gone`). The source comes last, in brackets. Their own words are in double quotes; the page they are on is in square brackets. The business is the file's or the object's name. Then one `grep` selects any kind of line: `grep '^claim .*no proof on the site'`, `grep '(observed)$'`, `grep '^2026-12-07 was '`.

**How words are chosen:** the graph names things: its words are nouns. The plan says what will be done: its words are verbs or name a step. Done says what happened: its words are in the past tense. Every word has to read aloud and make sense at a glance.

## The shape

```
spec 1
=== graph ===
=== plan ===
=== done ===
=== summary ===
```

A business just starting has only the done part. The summary is written by a skill from the three parts above, never by hand.

## Graph: how the business works

| Word | Example | Says | Status |
|---|---|---|---|
| **business** | `business coffee-shop: a takeaway coffee shop` | what the business is, in a line | new |
| **fact** | `fact visits: cloudflare coffee-shop.example visits (observed)` | something counted, where it is counted and its source | in use |
| **group** | `group Regulars: tag regulars` | who is in a group, by a rule; a person can be in several | in use |
| **needs** | `group Regulars needs: a quiet table before work` | why a group responds: its problem or want | new |
| **moving between groups** | `[Keen] not seen 6 weeks -> [Drifting]` | people changing state; what makes a simulation | new |
| **offer** | `offer loyalty card (plan): the tenth coffee free (stated)` | what is offered or asked for: a sale, a plan, an ask or a seat, in brackets after its name; never a price | new (the kind after the name is new: it was last, where the source now goes) |
| **channel** | `channel Instagram: the cafe's own account` | where things are said or sent | new |
| **->** | `new post -> visits: 20 to 40 of 100 views (assumed)` | this leads to that, at a rate, with its strength | in use |
| **-> with a group** | `comeback email [Drifting] -> visits: ? (unknown)` | how one group responds | in use (read, not yet played by group) |
| **when** | `when not seen 6 weeks -> comeback email` | something that happens and what follows | in use |
| **rule** | `rule visits down 3 weeks -> extra post` | what the business does when a number moves | to settle |
| **limit** | `limit seats: 24` | hours, jobs, seats, cups | new |
| **campaign** | `campaign winter warmers: from 2026-06-01 to 2026-08-31` | a named window that gathers a goal, a group, an offer, steps and content | new; how a line names its campaign is to settle |
| **cycle** | `cycle weekly` | the length of one turn; only the default for a step with no timing | in use (as `cycle:`) |
| area, icon | `area Website: visits, found the site` | how the picture is drawn | in use |
| **site** | `site http://localhost:4104 (sitemap)` | where its site is read from outside and how | new |
| **own** | `own` | in a market's folder: this ledger is the business's own, its site read beside what it tells us | new |
| **opens** | `opens Monday to Friday: 6.30 to 2.00 [/] (observed)` | the hours it gives | new |
| **claim** | `claim "Award-winning": no proof on the site [/] (inferred)` | something it says of itself a reader cannot check from the page, then `proof on the site` or `no proof on the site`, never other words | new |
| **proof** | `proof award: "First prize, sourdough, Wattle Shire Show 2025" [/about/] (observed)` | what lets a reader check a claim: an award, a supplier or a customer named | new |
| **answers** | `answers "Can I bring my dog?" [/questions/] (observed)` | a question its site answers, in its words | new |
| **until** | `offer Christmas cakes (sale): "Orders close on 15 December" [/news/christmas-cake-orders-open/] until 2026-12-15 (inferred)` | the day an offer ends, when its words give one | new |

**Inside and outside lines for one thing share its name.** `offer stamp card (plan): the tenth coffee free (stated)` and `offer stamp card: "the tenth coffee is on us" [/] (observed)` are the same offer seen from both sides. A name with only stated lines is something the business does that its site never says; a name with only observed lines is on its site and not in its plan.

**Plain ASCII.** A ledger is written in plain ASCII: a link is `->` and a step taken off is `-`. A reader also accepts the Unicode arrow (U+2192) and minus sign (U+2212), which older ledgers and AI chats use. It reads curly quotes and apostrophes as straight ones and odd spaces (such as the no break space) as ordinary spaces. Everything else in a ledger is kept as written.

**A link's rate** is a count (`8 of 41`), a range when assumed (`1 to 3 of 10`), borrowed (`like offers to share`), from the people list (`from people`) or unknown (`?`). It can say how long it takes (`, within 2 weeks`) and be marked a downside (`(unknown, downside)`).

**Group rules**, as dfm reads them today:

| Rule | Example |
|---|---|
| tag | `group Regulars: tag regulars` |
| status | `group Members: status paid` (paid, free or comped) |
| has | `group Has a birthday: has birthday` |
| opened | `group Keen: opened 3 of the last 4` |
| field answered | `group Answered: field visit-time answered` |
| field is | `group Mornings: field visit-time is morning` |
| joined from | `group From the market: joined from market stall` |
| email ends with | `group Office workers: email ends with @offices.example` |

The planning settled "the seven group rules as they are"; dfm reads eight. This draft lists all eight.

## Plan: what will be done

| Word | Example | Says | Status |
|---|---|---|---|
| **start** | `start 2026-11-16` | when the plan begins | in use |
| **want** | `want new regulars 2 a week by 2026-12-31` | the goal, as a count of actions | in use |
| **want for a group** | `want new regulars 1 a week [Office workers]` | a goal for one group | to settle |
| **how** | `how new post: Photograph the day's special before 10.` | what a step opens to | in use |
| **script** | `script comeback email: We have missed you at the coffee shop.` | the words a step sends, one paragraph a line, in order | in use |
| **a date before how or script** | `2026-12-01 how new post: The Christmas menu, out on Tuesday.` | that date's own how or script, for that week only | in use |
| **ask** | `ask new post: join the loyalty list` | the action a step asks someone to take | new |
| **by** | `every week new post by Sam` | who does the step | new |
| **on** | `on 2026-12-24: Christmas Eve, closed at noon` | a dated happening the business does not control: a holiday, a school term, a market day | new |

### Timing

| Kind | Written as | Example | Status |
|---|---|---|---|
| repeat | `every day`, `every week`, `every 2 weeks`, `every month`, each with an optional `from` date | `every week new post from 2026-11-23` | in use for `every week`; new for day, 2 weeks and month |
| inferred | a repeat worked out from what a business published, never told | `every week a post from 2026-11-02 (inferred)`; ticked by its posts (see Done) | new |
| ad hoc | a dated line | `2026-12-03 market stall` | in use |
| series | one step on several dates, each with its own detail after a colon | `2026-11-30 guest barista: Ana` then `2026-12-07 guest barista: Joe` | new (the detail) |
| added or taken off | a date with `+` or `-` | `2026-11-23 + flyer drop` | in use |
| unplanned | a done or said line with no plan step | see Done | new |

**A `+` step not ticked in its week carries forward** to every later week, marked with its week, until it is ticked or a `-` line takes it off. Each date in a series is ticked on its own and carries forward on its own; counts roll up under the step's name.

**Unplanned is never marked with `+`.** A check reports a done line with no plan step as unplanned, not as an error.

## Done: what happened

| Word | Example | Says | Status |
|---|---|---|---|
| **started** | `started 2026-11-16` | the week they began | in use |
| **done** | `2026-11-30 new post: done at 2026-12-01T09:10+11:00 Australia/Melbourne` | a step ticked and when | in use |
| **fact count** | `2026-11-16 fact count visits: 168` | how many in that week | in use |
| **fact total** | `2026-11-23 fact total loyalty list: 312` | how many on that day | in use |
| **fact count by group** | `2026-11-30 fact count new regulars [Office workers]: 1` | a count for one group; the whole stays its own line | to settle |
| **said** | `2026-11-30 said on Instagram on 2026-12-01: "Iced coffee is back" https://coffee-shop.example/iced-coffee/ [Regulars] topic: summer menu summary: "Iced coffee is back from Monday."` | what went out: the channel, the day, the title, the link, who it was for, its topic and a summary in the business's own words (never written for them). The topic is optional: with none it is unknown, left out of any comparison of topics and never guessed; a person can add one later | in use; the channel name and topic new |
| **counted to** | `2026-11-16 counted to 2026-11-18` | the week's counts are so far, to that day | in use |
| **read** | `2026-12-07 read on 2026-12-09` | its site was read from outside that week, on that day | new |
| **done by a post** | `2026-12-07 this week's special: done` | an inferred step ticked by a post published that week (its said line is just before) | new |
| **new**, **was**, **gone** | `2026-12-07 was offer kids meal: "Every kids meal is 10 dollars ..." [/questions/]` | a read found a graph or plan line first seen, changed (the line as it was) or no longer there | new |

A starting total is a `fact total` line in done. Every week is keyed by its Monday, in the business's time zone.

**A count and a total of the same fact never sit in the same week.** A check catches it.

## Where a number came from and how sure it is

| Name | On | Words | Means |
|---|---|---|---|
| source | facts and groups | observed, stated, inferred | a system counted it, a person told us, worked out from something else |
| source kind | a fact line | a counting skill's own name, `people` or `told` | which skill fills it in; `told` means someone tells us, by email or by hand |
| summary source | summary lines | calculated, modelled, inferred | added up from the lines, worked out by the forecast, worked out from something else |
| strength | links and any line that is a belief | proven, believed, assumed, unknown | how much evidence backs it |

**An assumption** is any line marked `(assumed)`: a belief not yet shown by counts. Counts move it to believed or proven. They can also show it was wrong.

A count by group takes the less sure of the fact and the group.

**On every graph and plan line, the source is last:** `(stated)`, `(observed)` or `(inferred)`. A line with no source word, as older ledgers have, is read as `(stated)`: the person wrote it. Code always writes the word; a line gets it when it is next changed: `grep '(stated)$'` then finds every one. Not every reader takes a source on every line yet (a fact line, yes): check what reads a ledger before a new word goes into one a live page reads.

## Summary

Written on every change from the three parts above, never by hand. The goal, each counted fact's weekly numbers and average, the forecast, this week so far, who the week's content was for and what is not counted (unknown is not zero). Every line ends with its summary source in brackets and says whether it is a want, an expectation or something that happened.

## Only in what ifs

| Word | Example | Status |
|---|---|---|
| extends | `extends coffee-shop.graph` | in use |
| removes | `removes: comeback email -> visits` | new (`remove:` in dfm today) |

## Outside the ledger

- **Named people:** in the business's own systems; the [people](named.md) format holds ids and states only.
- **The why:** in a decision log beside the ledger. A pointer from a line to its entry is to settle.
- **Forecasts:** kept in the [forecast](named.md) format, dated so reality can check them.
- **Money:** never.
