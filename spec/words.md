# Words (spec 1, draft)

One piece of content: a post, an email, a share for a channel or a message to one person. Content skills write it; publishing skills read it. It is always built from the person's own words (a recording, notes, a reply), polished and never invented.

## The shape

```
spec 1
kind: post
state: draft
title: Iced coffee is back
excerpt: From Monday, with cake from the bakery next door.
channel: website
topic: summer menu
for: Regulars
ask: join the loyalty list
campaign: summer drinks
link: https://coffee-shop.example/iced-coffee/
from: recordings/2026-11-28-sam.txt
=== body ===
The first hot morning always brings the same question at the counter.

Iced coffee is back from Monday.
```

## The fields

| Field | Says | Required |
|---|---|---|
| kind | post, email, share or message | yes |
| state | idea, draft, approved or published | yes |
| title | the title, in the person's words | for a post or email |
| excerpt | one or two sentences, in the person's words | no |
| channel | where it goes, a channel named in the ledger | yes |
| topic | what it is about | no |
| for | the group or groups it is for; everyone if none | no |
| ask | the action it asks someone to take | no |
| campaign | the campaign it belongs to | no |
| link | where it is or will be | no |
| from | the source its words came from: a transcript, notes, a reply | yes |
| tags | the platform's tags, comma separated | no |

The body comes after `=== body ===`, one paragraph per block, separated by a blank line.

## States

- **idea:** a title and a line, nothing written
- **draft:** written, not yet approved
- **approved:** the person said yes to the words
- **published:** out; a `said` line in the ledger records it

No skill moves a piece to published. A person publishes; a reading skill notices it went out and writes the `said` line.

## Rules

1. **Every quote and claim can be found in `from`.** A [check report](check-report.md) proves it before a draft goes anywhere.
2. **House rules from [settings](settings.md) apply** (spelling, length, words to avoid) and are checked after writing, never trusted.
3. **A share or message names the post it points to** in `link`.
