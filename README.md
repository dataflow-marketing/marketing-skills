# marketing-skills

dfm (dataflow marketing) keeps a business's marketing context: how its marketing works, what it plans, what happened and how it speaks. Any AI then works from facts, not guesses.

Marketing skills for Claude from [dataflow.marketing](https://dataflow.marketing): small pieces that fit together. With them a business can keep that context, plan its marketing, make content from its own words, publish drafts and count what happened.

## Why this exists

This is based on real work I'm currently doing at [influencer.tips](https://www.influencer.tips/). It is an opportunity to share the method.

Questions are welcome: email me at matt@mattcameron.me. Feel welcome to raise an [issue](https://github.com/dataflow-marketing/marketing-skills/issues). Everyone taking part follows the [code of conduct](CODE_OF_CONDUCT.md).

**Status: planning done, nothing to install yet.** The shared formats come first: [spec 1](spec/README.md) is a draft. Skills are built on it next.

## A worked example

[The coffee shop](examples/coffee-shop/README.md) follows one made up coffee shop through a week of the loop, with its whole ledger.

## Who it is for

- **A business running its own marketing,** with Claude Code.
- **Someone running marketing for clients,** keeping each client's context in one place.

## Where to start

**Start on the [starter plan](examples/starter/README.md):** four steps a week, then change one thing at a time.

**Today, with no install:** [ask an AI about your marketing plan](docs/ask-an-ai.md). Paste the coffee shop's copy into ChatGPT to see it work, then make one for your own business by hand.

**When the skills are built:**

Start with a recipe. A recipe runs the skills a job needs in order and stops for a yes at each step:

- `/dfm-recipes:client-run` sets up a business: its site, its profile and a first plan
- `/dfm-recipes:week-run` brings in the week's counts and writes the summary
- `/dfm-recipes:recording-run` turns a recording into a draft post

Each skill can also be used on its own once you know what you need.

## Safety

- **No skill publishes.** Anything put on a platform is a draft; a person publishes.
- **A yes before every write.** Each write shows what would change, waits for a yes, writes and reads it back.
- **Keys never pass through Claude.** Scripts read them from a keys file named in settings.
- **No names in a ledger.** People stay in the business's own systems; a ledger holds groups and counts.
- **Nothing invented.** Content comes from the person's own words; a check proves every quote.

## Words used here

| Word | Means |
|---|---|
| context | everything an AI needs to know about a business's marketing: its ledger and its profile |
| ledger | how a business's marketing works, what it plans, what happened and a summary |
| profile | what a business says and how it says it |
| skill | one job Claude can do, such as `/dfm-ghost:post-draft` |
| piece | a skill seen as one part that fits with others |
| recipe | a skill that runs other skills in order |
| runner | what runs the skills for real people on a schedule: a member page, a scheduled job or a person in Claude Code |
| capability | what a platform skill offers, such as counts or drafts; any platform can fill it |
| connector | how a store keeps an object: a file, Ghost or a REST backend |
| scripted | a ready made function a skill runs where a guardrail is needed |
| guided | a script Claude writes for the job as it goes |
| carried | a skill whose instructions travel inside what it makes; it works in any AI chat |

## How the names work

Every skill is `dfm-<area>:<thing>-<verb>`:

- `/dfm-ghost:post-draft` puts a post on Ghost as a draft
- `/dfm-content:quotes-check` checks every quote against its source
- `/dfm-recipes:week-run` runs the weekly run

The verb says what a skill does:

| Verb | Means | Writes |
|---|---|---|
| read | fetches numbers or content | never |
| check | inspects and names problems | never |
| make | makes something new | a new file only |
| change | alters something that exists | after a yes, read back |
| record | adds lines to a ledger | yes |
| draft | puts a draft on a platform | as a draft, never published |
| add | registers a site, a key or a definition | settings |
| remove | removes something | a backup first, after an explicit yes |
| run | a recipe: several skills in order | through its skills |

## What is built

A work in progress: skills are written one at a time in this order. Each is listed here when it works.

| Step | Skills | State |
|---|---|---|
| spec 1 | the shared formats | draft |
| ask an AI by hand | the instructions, the coffee shop copy and a tutorial | ready to try |
| first loop | dfm-content:quotes-check, post-make; dfm-ghost:site-add, post-draft; dfm-recipes:recording-run | next |
| ledger core | dfm-ledger:plan-make, plan-change, plan-check, counts-record, summary-make, askai-make; dfm-cloudflare:visits-read; dfm-ghost:numbers-read; dfm-recipes:week-run | planned |
| the rest | content, learning and forecasting, new platforms, upkeep | planned |

## Install (when the first skills are here)

```
/plugin marketplace add dataflow-marketing/marketing-skills
/plugin install dfm-ghost@dataflow-marketing
```

## Why things are the way they are

[DECISIONS.md](DECISIONS.md). MIT licensed.

## Contributing

Pull requests are welcome; mattcam reviews each one. [CONTRIBUTING.md](CONTRIBUTING.md) says how they are accepted.
