# marketing-skills

dfm (dataflow marketing) keeps a business's marketing context: how its marketing works, what it plans, what happened and how it speaks. Any AI then works from facts, not guesses.

Marketing skills for Claude from [dataflow.marketing](https://dataflow.marketing): small pieces that fit together. With them a business can keep that context, plan its marketing, make content from its own words, publish drafts and count what happened.

## Why this exists

This is based on real work I'm currently doing at [influencer.tips](https://www.influencer.tips/). It is an opportunity to share the method.

Questions are welcome: email me at matt@mattcameron.me. Feel welcome to raise an [issue](https://github.com/dataflow-marketing/marketing-skills/issues). Everyone taking part follows the [code of conduct](CODE_OF_CONDUCT.md).

**Status: the foundation is built, nothing to install yet.** The shared formats come first: [spec 1](spec/README.md) is a draft. The first skills are being written now; [the plan](#the-plan-and-where-it-is-up-to) shows where each part is up to.

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

## The plan and where it is up to

Everything planned, in the order it is built. Each row changes in the same commit as the work it describes.

**State:** `planned` not started | `next` being written now | `built` in the repo with its tests | `works` built and has done one real job

**Kind:** `code` a script does the work and is tested | `model` an AI model writes it from the person's own words and a check proves it | `recipe` runs other skills in order

**Script:** `yes` a script is built and committed in the skill's `dist/` folder | `no` none yet | `none` the skill needs none (guided: Claude does the job by its instructions)

**Version:** a plugin has one version for all its skills, shown in its heading. Every plugin starts at `0.x` and reaches `1.0` when spec 1 is frozen. A plugin with no built skill is `not started`.

### Build order

| Step | What | State |
|---|---|---|
| 1. spec 1 | the shared formats: ledger, words, settings, check report, store, profile, forecast | built (a draft until the first skills run on real work) |
| 2. ask an AI by hand | the instructions, the coffee shop copy and a tutorial | works |
| 3. the foundation | the workspace, `packages/core` (settings, keys, output, run log, build) and the writing check | built |
| 4. first loop | quotes-check, post-make, site-add, post-draft, recording-run | next |
| 5. ledger core | the ledger skills and week-run | planned |
| 6. the rest | content, media, storage, more platforms, upkeep | planned |

### The foundation

| Part | Does | Tests | Version | State |
|---|---|---|---|---|
| `spec/` | the shared formats every skill reads or writes | | spec 1 (draft) | built |
| `packages/core` | reads settings and keys, checks settings, formats output and the run log line, builds and checks the bundled scripts | yes, beside each file | 0.1.0 | built |
| `scripts/` | checks the writing rules across the repo (`pnpm check`) | yes | 0.1.0 | built |
| `examples/coffee-shop` | the made up business every test and example uses | | | built |
| `examples/starter` | the starter plan: four steps a week | | | built |
| `examples/store-worker` | a starter Hono Worker on D1 that meets the store contract | | not started | planned |
| tests on every pull request | GitHub runs the tests, the typecheck and the writing check | | | planned |

The examples have no version: they are read, never installed.

### dfm-content: words, from the person's own (not started)

| Skill | Does | Kind | Script | State |
|---|---|---|---|---|
| quotes-check | checks every quote, name and number in a text against its source | code | no | next |
| post-make | turns their own words (a transcript, notes, a reply) into a post, never invented | model | none | next |
| profile-make | makes a business's profile from its site | model | none | planned |
| share-make | words to share a post or clip on a channel | model | none | planned |
| message-make | a direct message or 1:1 email from their words | model | none | planned |
| ideas-make | what to make next and why, from what people asked | model | none | planned |
| schedule-make | a run of weeks, each with its post and share | model | none | planned |

### dfm-ghost: Ghost sites (not started)

| Skill | Does | Kind | Script | State |
|---|---|---|---|---|
| site-add | adds a site to settings; the key goes in through a hidden prompt | code | no | next |
| post-draft | puts a words file on Ghost as a draft and reads its status back | code | no | next |
| numbers-read | a week's members, paid plans, emails, opens and clicks | code | no | planned |
| fields-read | a member's custom fields | code | no | planned |
| fields-change | changes one custom field for one member, read back | code | no | planned |
| field-add | adds a custom field definition | code | no | planned |
| post-change | changes a published page's text on an explicit ask, with a backup | code | no | planned |
| member-signin | a sign in link for a member, to the terminal only | code | no | planned |

### dfm-ledger: the method, on any platform (not started)

| Skill | Does | Kind | Script | State |
|---|---|---|---|---|
| plan-make | a new ledger from a conversation | model | none | planned |
| plan-change | changes a ledger, the difference shown first | code | no | planned |
| plan-check | reads every line and names the problems | code | no | planned |
| counts-record | adds the week's counts, ticks and said lines | code | no | planned |
| summary-make | writes a ledger's summary | code | no | planned |
| askai-make | a copy of the ledger and profile for any AI chat | code | no | planned |
| inbox-read | proposes changes from messages in and says what needs a reply | model | none | planned |
| followups-check | what needs following up | code | no | planned |
| rates-record | learns how well each link works from the counts | code | no | planned |
| whatif-make | what a change would bring; the forecast is kept | code | no | planned |
| picture-make | a ledger's flow as a diagram | code | no | planned |
| people-read | counts a people list by group and state | code | no | planned |
| report-make | a short report for a period | model | none | planned |
| weeks-archive | rolls old weeks into months to keep a ledger small | code | no | planned |
| spec-migrate | moves a ledger to a newer spec | code | no | planned |

### dfm-media: recordings and clips (not started)

| Skill | Does | Kind | Script | State |
|---|---|---|---|---|
| transcript-make | a recording's transcript, made on your own machine | code | no | planned |
| clips-make | clips from a recording, titled in the speaker's words | model | none | planned |
| video-encode | a copy of a clip that fits a channel's size limit | code | no | planned |
| still-make | a share card or still from a clip or post | code | no | planned |

### dfm-store: any object, in any store (not started)

| Skill | Does | Kind | Script | State |
|---|---|---|---|---|
| store-add | adds a store to settings: a file, Ghost member fields or a REST backend | code | no | planned |
| store-check | the store answers and its key works | code | no | planned |
| objects-read | lists the objects of a kind | code | no | planned |
| object-read | one object with its version | code | no | planned |
| object-change | changes an object only if no one else has since, read back | code | no | planned |
| object-add | adds an object | code | no | planned |
| object-remove | removes an object, a backup first | code | no | planned |

### dfm-cloudflare: site numbers from Cloudflare (not started)

| Skill | Does | Kind | Script | State |
|---|---|---|---|---|
| visits-read | a site's visits and views for a week | code | no | planned |
| pages-read | the most read pages | code | no | planned |
| referrers-read | where visitors came from | code | no | planned |
| token-check | which sites a token can see | code | no | planned |
| deploy-check | a Worker's live settings against its file | code | no | planned |

### dfm-stripe: sales and payment links (not started)

| Skill | Does | Kind | Script | State |
|---|---|---|---|---|
| sales-read | how many sales and subscriptions, by offer (counts, never amounts) | code | no | planned |
| link-make | a working payment link for an offer | code | no | planned |
| links-check | payment links on a site that do not take a payment | code | no | planned |

### dfm-site: any website (not started)

| Skill | Does | Kind | Script | State |
|---|---|---|---|---|
| llms-check | whether a site's `/llms.txt` is on and what it holds | code | no | planned |
| links-check | links on a site that do not work for a visitor | code | no | planned |

### dfm-social: channels with no API (not started)

| Skill | Does | Kind | Script | State |
|---|---|---|---|---|
| pack-make | a ready to post folder for a channel with no API | code | no | planned |

### dfm-recipes: the front door (not started)

| Recipe | Runs, in order | State |
|---|---|---|
| recording-run | transcript-make, post-make, quotes-check, post-draft | next |
| week-run | the week's counts from each platform, counts-record, summary-make, followups-check | planned |
| client-run | site-add, llms-check, profile-make, quotes-check, plan-make, fields-change | planned |
| clips-run | transcript-make, clips-make, video-encode, share-make, pack-make | planned |
| calendar-run | ideas-make or schedule-make, then plan-change | planned |
| reply-run | inbox-read, then plan-change and counts-record on a yes | planned |
| report-run | summary-make, rates-record, report-make | planned |
| review-run | whatif-make, picture-make | planned |
| health-run | llms-check, links-check, stripe links-check, profile-make | planned |

## Install (when the first skills are here)

```
/plugin marketplace add dataflow-marketing/marketing-skills
/plugin install dfm-ghost@dataflow-marketing
```

## Why things are the way they are

[DECISIONS.md](DECISIONS.md). MIT licensed.

## Contributing

Pull requests are welcome; mattcam reviews each one. [CONTRIBUTING.md](CONTRIBUTING.md) says how they are accepted.
