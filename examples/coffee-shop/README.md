# Worked example: the coffee shop

The coffee shop (`coffee-shop`) is a made up takeaway coffee shop at coffee-shop.example. Its whole context is in [ledger.txt](ledger.txt). This page follows one week of the loop: **plan, do, count, summarise, change the plan.**

The skills named here are planned; see [what is built](../../README.md#what-is-built).

## The plan

The owner set it up with `/dfm-recipes:client-run`. The goal is a count of an action, not money:

```
want stamp cards started 10 a week by 2026-12-31
```

The graph says how the café works: opening brings visits, visits become cups served or people turned away, a stamp card offered at the counter starts stamp cards. Three weekly steps: open the café, offer the stamp card, post on Instagram. One ad hoc step: the market stall on 3 December.

## Do (week of 30 November)

- The steps are ticked as they are done.
- On Saturday the owner made a recording about iced coffee coming back. `/dfm-recipes:recording-run` turned it into a draft post from the owner's own words, checked every quote against the recording and put it on the website as a draft. The owner published it.
- The post went out on Instagram on Tuesday. It is recorded as a `said` line: the channel, the day, the title, the link, who it was for and its topic.

## Count

The café's till has no counting skill. `/dfm-recipes:week-run` asks the owner for the numbers and records them as `told`:

```
2026-11-30 fact count stamp cards started: 4
2026-11-30 counted to 2026-12-02
```

The week is not over: the line says the counts are only to Wednesday.

## Summarise

`/dfm-ledger:summary-make` writes the summary from the lines, never by hand. Each line says whether it is something wanted, expected or that happened:

```
goal: stamp cards started 10 a week by 2026-12-31 (want)
stamp cards started a week: 6, 9; average 7.5 (calculated, happened)
forecast: 10 a week by 2026-12-31: likely the week of 2026-11-30; rough, 2 counted weeks (modelled, expect)
forecast: now 7.5 a week; to reach 10 by 2026-12-31 it has to rise about 0.6 a week (modelled, expect)
```

The forecast is a straight line through the two counted weeks: it says the goal is likely this week. It also says the line is rough: two weeks are not much to go on. Three days in, the count is 4. The next counts will show whether the line holds.

## Change the plan

The owner runs `/dfm-ledger:askai-make` and pastes the copy into ChatGPT with one question: how do we get to 10 stamp cards a week? The AI works from the context and ends with suggestions:

```
Change: 2026-12-07 + stamp card reminder on Instagram
Change: how stamp card at the counter: Offer a stamp card with every first coffee and say the tenth is free.
```

The owner keeps the second one only and sends it back. `/dfm-ledger:plan-change` shows the change, waits for a yes, writes it and reads it back.

## The next turn

Next week's counts show whether saying "the tenth is free" starts more stamp cards. If it does, the rate on that link moves from believed towards proven. If not, the plan changes again. Every turn leaves more evidence than the last.
