# Spec 1 (draft)

The shared formats every dfm skill reads or writes. Skills never call each other: they meet through these formats. Any skill that writes one fits any skill that reads it.

**Status: draft.** It is tested by the first skills built on it. It is frozen as spec 1 only when the first loop (a recording to a draft post) and the ledger core (the weekly run) both work on real businesses. Until then anything here can change.

## Context

Everything here serves one thing: a business's marketing context, kept so any AI has what is important to work with and nothing it needs to invent.

Context is two formats together:

- **the [ledger](ledger.md):** how the business's marketing works, what it plans, what happened and a summary of the numbers
- **the [profile](profile.md):** what the business says and how it says it, in its own words

`dfm-ledger:askai-make` puts them together, with their own instructions, for any AI chat such as ChatGPT: see [ask an AI](ask-ai.md). Every other format feeds one of them or is made from them.

## The method

Dataflow marketing models the past to predict the future.

- **The graph is the how:** what leads to what in this business, at what rate and how sure that is.
- **The counts are the what:** what actually happened, week by week.

Every week turns the same loop: **plan, do, count, summarise, change the plan.** Each turn adds counts. Counts move beliefs from assumed towards proven. The next plan rests on more evidence than the last.

## A person decides

An AI can suggest; only a person changes the plan. An AI conversation ends in `Change:` lines. A person reads them, sends back the ones they want and only then is the plan changed, with a yes before the write. The context stays the business's own record of what it chose.

## Why forecasts matter

Keeping context pays off in one question: **when is the goal likely?** A forecast works it out from the graph and the counts so far. It is kept and dated. The weeks that follow can then check it. This is why want, expect and happened never mix: a business needs to see what it wants, what it can expect and what actually happened side by side.

## What is not here

The skills keep and use a business's context. How a business works with its own context is up to the place it lives, for example a member page on a website:

- how ticks and numbers reach the ledger: ticked on a page, sent by email or typed by hand
- the page a person sees their plan on
- how someone running many businesses sees and reviews each one
- a weekly email that asks for the week's numbers

Any of these can be built on the formats here. None of them is a skill.

## The parts

| Format | Holds | In this draft |
|---|---|---|
| [ledger](ledger.md) | how a business's marketing works, what it plans, what happened, a summary | in full |
| [words](words.md) | one piece of content: a post, an email, a share, a message | in full |
| [settings](settings.md) | a user's sites, stores, bindings, time zone and house rules | in full |
| [check report](check-report.md) | each quote and claim in a text, found in its source or not | in full |
| [store](store.md) | how any object is read and written, wherever it lives | in full |
| [inbox](inbox.md) | messages in for a business: one record a message, easy to grep | draft |
| [the others](named.md) | counts, people, media, forecast, run log | named, one line each |
| [profile](profile.md) | what a business's website says and how, summarised from its own text and checked | in full |
| [forecast](forecast.md) | how a summary works out when the goal is likely: plain arithmetic, no AI | in full |
| [ask an AI](ask-ai.md) | the copy for any AI chat, its instructions and the `Change:` lines that come back | in full |
| [how a skill works](skills.md) | instructions, scripts and how they are built | in full |

## Rules every format keeps

1. **Plain text a person can read aloud.** No format needs a tool to be read.
2. **The first line names the spec:** `spec 1`.
3. **Every number says where it came from and how sure it is.** A guess never looks like a count.
4. **Want, expect and happened never mix.** A goal is what a business wants, a forecast what it expects, a fact what happened.
5. **No money.** Goals and facts are counts of actions (sign ups, sales, donations, bookings), never revenue or cost.
6. **Groups, not individuals.** Named people stay in the business's own systems. A ledger holds rules and counts.
7. **The business's own words for things.** A cafe's "regulars", not a standard term.
8. **Nothing personal in a skill.** Sites, keys, members and house rules live in settings.

## The example business

Every example in this spec is the coffee shop (`coffee-shop`), a made up takeaway coffee shop at coffee-shop.example: the coffee shop dataflow marketing has used as its worked example since November 2026. No example is a real business or person.
