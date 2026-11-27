# Inbox (spec 1, draft)

Messages in for a business: replies, comments, enquiries, the response an AI chat wrote. `dfm-ledger:inbox-read` keeps them here, then proposes changes to the business's [ledger](ledger.md) from them. Plain text, easy to grep, like the ledger.

## The shape

```
spec 1
=== messages ===
--- 2026-12-02 from coffee-shop by email: reply
I have 312 people on the loyalty list now.
How do I get more of them to come on a Saturday?
--- 2026-12-03 from coffee-shop on LinkedIn: comment
Shared the iced coffee post: https://www.linkedin.com/posts/...
```

One file a day it was read in, `inbox/<date>.txt`, never written over: a later batch the same day is a new file (`inbox/2026-12-02-b.txt`).

## A message

A line starting `--- ` opens each message; its text follows, as it came, up to the next `--- ` line.

| Part | Example | Says |
|---|---|---|
| date | `2026-12-02` | the day it was sent |
| from | `from coffee-shop` | the business it is about, by its name in settings: never a person's name or address |
| channel | `by email`, `on LinkedIn` | how it came, in the ledger's words for a channel |
| kind | `reply`, `comment`, `enquiry`, `change` | what it is: `change` is an AI chat's response with `Change:` lines |

Then `grep '^--- .* from coffee-shop'` lists a business's messages, `grep '^--- .*: enquiry'` every enquiry.

## Rules

1. **As it came, less who sent it.** The text is kept as it was sent, except a person's name, address or phone number: each is written `[name]`, `[address]` or `[phone]`. The ledger counts groups, never individuals.
2. **Read only what was given.** A person gives the messages; no skill reads a mailbox on its own.
3. **Nothing in it changes a ledger by itself.** Every change goes through `dfm-ledger:counts-record` or `dfm-ledger:plan-change`, on a yes.
