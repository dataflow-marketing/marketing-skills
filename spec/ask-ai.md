# Ask an AI (spec 1, draft)

A business's context, copied with its own instructions: any AI chat (ChatGPT, Gemini, the Claude app) can then help with the plan. Nothing is installed: the instructions travel inside the copy. The conversation ends in `Change:` lines that a person sends back. This is in daily use in dataflow marketing.

`dfm-ledger:askai-make` writes the copy. `dfm-ledger:inbox-read` and `dfm-ledger:plan-change` take the `Change:` lines back.

## The copy

Three parts, in this order:

```
=== read this first ===
(the instructions)
=== their website ===
(the profile)
=== their plan ===
(the ledger, with a summary written fresh at copy time)
```

## The instructions

The instructions themselves are in [ask-ai-instructions.txt](ask-ai-instructions.txt), ready to copy, with two blanks: `{who}` and `{send to}`. A ready made copy for the example business is [examples/coffee-shop/ask-ai-copy.txt](../examples/coffee-shop/ask-ai-copy.txt).

They tell the AI how to read the ledger and how to behave. They always say:

**Reading**

- What each part of the ledger means and how each kind of line reads, in plain words.
- Take every number from the summary; never work one out again.
- Not counted is not zero. A `?` or a fact not counted yet is unknown, never 0.
- A summary line marked inferred is a likely reading. Never build a suggestion on it.

**Behaving**

- Never invent content. Suggestions name directions from the plan. The words of a post, a message or a step come from the person: the AI asks for them, then polishes them (shorter, plainer, the same meaning).
- The AI cannot change the plan or send anything. It never says something is sent or done.
- Before suggesting a change, check it is not in the plan already.
- Lead one choice at a time: a short reply, then 2 to 4 numbered choices, the last always "Something else".
- At most 7 rounds. Each reply after the first starts with its round, for example `Round 3 of 7`. Round 7 gives no more choices: it writes the response.
- The first reply says where they are against their goal, with the summary's numbers. Its first choice is always "Top 3 quick wins": three small things for this week, from what they already have.
- A picked option is shaped in this order: how often, what it leads to, who it is for, then its words. Words come last: they are what stays open if the rounds run out.
- It ends with a response the person can send: the `Change:` lines, one sentence on why in their words and any finished piece (a post, an email, a message) written from their own words.

**Filled in at copy time:** who the plan belongs to and where to send the response. Nothing else in the instructions is personal.

## Change lines

Each `Change:` line is an ordinary [ledger](ledger.md) line with `Change:` in front:

```
Change: every week stamp card reminder on Instagram from 2026-12-07
Change: 2026-12-07 + market stall
Change: how stamp card at the counter: Offer a stamp card with every first coffee and say the tenth is free.
Change: script comeback email: We have missed you at the coffee shop.
Change: fact reminders seen: told
Change: stamp card reminder on Instagram -> stamp cards started: ? (unknown)
Change: 2026-11-30 said on Instagram on 2026-12-01: "Iced coffee is back" https://coffee-shop.example/iced-coffee/ [everyone] summary: "Iced coffee is back from Monday."
```

- **A monthly step** is one dated line for each of the next three months, until `every month` is built.
- **A step that sends words** has one `Change: script` line per paragraph, in order, then the whole message written out under the lines.
- **Something said on a social site** comes back as a `said` line, in the person's words exactly.
- **What it should lead to** is always included, as a link with a `?` rate until it is counted.

## The way back

1. The person sends the response by email or pastes it.
2. `dfm-ledger:inbox-read` finds the `Change:` lines and checks each reads as a ledger line.
3. `dfm-ledger:plan-change` shows the change to the plan, waits for a yes, writes it and reads it back.

The AI never writes to the plan. A person always decides.
