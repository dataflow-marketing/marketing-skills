# Forecast (spec 1, draft)

How a summary answers "when is the goal likely?" Plain arithmetic, no AI and no service: a scripted function in `dfm-ledger`, used by `summary-make` and `whatif-make`. It uses web standard JavaScript only: it runs the same in Node, in a Worker and in a browser. In daily use in dataflow marketing.

## In

- the goal: a fact, a number a week and a date (`want stamp cards started 10 a week by 2026-12-31`)
- the counted weeks of that fact: each week's Monday and its count, oldest first
- this week's Monday

A week still running (`counted to`) is not a counted week yet.

## Out

| Line | Says | How |
|---|---|---|
| now | the weekly number today | the average of the counted weeks |
| likely | the week the goal is likely reached | where a straight line through the counted weeks reaches the goal |
| rough | the line is not settled yet | true until 8 weeks are counted: a line through a few weeks moves a lot with one good or bad week |
| rise | how much the weekly number has to go up each week to reach the goal by its date | (goal − now) ÷ weeks left |

## Rules

1. **The line is the least squares line** through the counted weeks: the line that sits closest to every week at once.
2. **No date when the line cannot give one:** fewer than 2 counted weeks, a line that is not rising or a date more than five years away. The summary says why instead of guessing.
3. **Already there:** when the average is already at the goal or the line passed it, the likely week is this week.
4. **Always marked:** every forecast line is `(modelled, expect)`. A rough one says it is rough.
5. **Kept:** each forecast is kept and dated in the [forecast kept](named.md) format. Later weeks can then check it.

## Why a scripted function

A forecast is a number people act on. Worked out by an AI each time, it could change between asks or be invented. As code it gives the same answer every time, can be tested on the example business and runs straight away.

## The coffee shop

Counted weeks: 6 (16 Nov) and 9 (23 Nov). Goal: 10 a week by 31 December.

```
forecast: 10 a week by 2026-12-31: likely the week of 2026-11-30; rough, 2 counted weeks (modelled, expect)
forecast: now 7.5 a week; to reach 10 by 2026-12-31 it has to rise about 0.6 a week (modelled, expect)
```
