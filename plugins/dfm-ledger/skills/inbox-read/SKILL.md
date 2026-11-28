---
name: inbox-read
description: Read messages in for a business (replies, comments, enquiries, an AI chat's response) into its inbox, then propose the changes they ask for to its ledger, through counts-record and plan-change, written only after a yes; and list the messages that need a reply, for dfm-content:message-make. Use when someone brings in messages ("here are this week's replies", "she replied to the email", "what do I do with these comments").
---

# inbox-read

A guided skill. Claude reads and sorts; `dfm-ledger:counts-record` and `dfm-ledger:plan-change` preview, write on a yes and read back. Claude never edits a ledger by hand. The shape is [the inbox](../../spec/inbox.md).

## The rules that come first

- **Only what they said.** Every change comes from a message's own words or numbers. Never invent a total, a goal or a step. When a message could mean more than one thing, ask.
- **Nothing changes without a yes.** Every write is previewed first.
- **A total, not a count from memory.** "I have 312 followers" is read off a platform: a total. "I got a few new ones" is not a number: tell the person, write nothing.
- **Who sent it stays out.** Names, addresses and phone numbers never go into the inbox or the ledger.
- **Notes to the person never go in the ledger.** Anything they should read is a `how` line in their plan; anything only for you stays in this conversation.

## Steps

1. **Bring the messages in.** The person pastes or gives them; no skill reads a mailbox on its own. Find the business each is about: by the sender's address on a binding in settings; otherwise ask. Write `inbox/<today>.txt` in the inbox's shape, never over a file already there.

2. **Copy the ledger out** when it is kept in a store: `dfm-store:object-read --object ledger --business <b> --out runs/<today>/<b>/ledger.txt`, a new folder each time. Work on the copy. With no store, work on the ledger file.

3. **Sort each message,** one by one:
   - **A total read off a platform:** `dfm-ledger:counts-record --total "<fact>=<n>"`, for a fact the graph has. A number for a fact the graph does not have: ask whether to start counting it (a `Change: fact <name>: told` line).
   - **`Change:` lines** (an AI chat's response, made with `dfm-ledger:askai-make`): `dfm-ledger:plan-change` with the message as it came.
   - **A post they shared** (its link and words): a `Change: <its Monday> said on <channel> on <its day>: "<its first line>" <its link> [everyone] summary: "<its first two sentences>"` line, their words exactly, through plan-change.
   - **What they want; what is not working:** a light change, only when the message makes it plain: a step (`Change: every week <step> from <a Monday>`) or what a step opens to (`Change: how <step>: <their words, polished>`). A line or two, never a rebuild. Show it as a proposal first.
   - **An answer to an account question** (where they are online, what kind of business): `dfm-ghost:fields-change` for that field, the choice word for word; for a member on a Ghost site.
   - **A question; something they ask for:** it needs a reply (below). A question about what they could make is also an idea for `dfm-content:ideas-make`.
   - **Nothing to do:** say so.

4. **Check and sum up the copy:** `dfm-ledger:plan-check` must pass; then `dfm-ledger:summary-make`.

5. **Show it all, then write on a yes.** For each message: what goes in, what comes out, what needs a reply. For a ledger in a store: `dfm-store:object-change --preview`, then on the yes `--go --version <the version its preview printed>`. A ledger that changed since it was copied out stops on its own: copy it out again and redo the changes.

6. **What needs a reply.** List each message that asks something, with what it asks. Offer to draft each reply with `dfm-content:message-make`, from the person's own words. They send it; no skill sends a reply.

## Asking

- **Ask with the question dialog** where there is one: every question and every yes, with options such as "Yes, go on", "Change something" and "Stop". Where there is no dialog, the question is the last line of the message.
- **Ask for what is missing; never guess it.** When an answer could mean more than one thing, ask which.
- **Say which message this is** at the start of each step: "Message 2 of 5: a reply by email".
