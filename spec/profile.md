# Profile (spec 1, draft)

What a business's website says and how it says it, summarised from the site's own text. With the [ledger](ledger.md) it makes the business's context: the ledger says what the business does, the profile says how it speaks. An AI uses it to keep suggestions in the business's voice and to point to pages it already has. This is in daily use in dataflow marketing, where it is kept as a member's Context.

`dfm-content:profile-make` makes it. `dfm-content:quotes-check` checks it.

## In

- **The home page,** as text.
- **The site's `/llms-full.txt`:** every page and post as plain text. Some site builders can serve it (Ghost has a setting for it).
- **Or, when there is no `/llms-full.txt` and the person says yes: the pages its `/sitemap.xml` lists,** up to 50, each read as text the same way as the home page. The counted part then says `(in the sitemap)`.

Nothing else. No search, no other sites, no platform's API, no guessing from the business's name.

## The shape

```
spec 1
=== their website ===
=== counted ===
pages: 3, posts: 4 (in /llms-full.txt)
words per post: about 40 on average, 25 to 60
most read, 23 to 29 Nov 2026: "the home page" 120; "Iced coffee is back" 45

=== read from the site ===
what the site is and who it is for:
...
how they write:
"<a sentence, word for word>" [<the page it is from>]
...
```

## Counted, never by a model

Pages, posts, words per post and the most read pages (from the site's analytics, if it has any) are counted by code. A model is given them as facts it must not change.

## Read from the site by a model

Fourteen parts, each a label then plain full sentences, about 1,100 to 1,400 words in all:

1. what the site is and who it is for
2. who is behind it
3. who they speak to (only the audiences the site names)
4. what it offers
5. what they believe
6. kinds of content and their shapes
7. how titles and headlines are written
8. how it is said
9. words and phrases they use
10. themes they come back to
11. channels and tools they mention
12. proof they show (only testimonials, examples and past work on the site)
13. questions the site answers
14. what it asks readers to do

Titles and phrases given as evidence are in double quotes, exactly as on the site.

## How they write

Six to eight of the business's own sentences, **chosen** by the model, never written by it. Each is on its own line in double quotes, word for word, with the page it came from in brackets. They are how an AI learns the business's voice. A sentence not found word for word on the site is dropped.

## Never asked for

Where the business is, what currency it uses, what it does not do: none of these unless the site says it. Asked once, a model wrote a country and a currency that were on no page.

## Checked

1. **Names, numbers and money:** every name, number (in figures or in words) and currency in the profile must be on the site or in the counts.
2. **Quotes:** every quoted title, phrase or sentence must be found on the site, word for word.
3. **A second turn:** when a check fails, the model is told exactly what failed and asked again, keeping everything else.
4. **A person reads it.** Code cannot catch a claim with no name or number in it ("a small team curates the content"). A person reads every profile before it is kept. A sentence that is not on the site is removed, never reworded: rewording an invention keeps the invention.

## Kept

Where the business can see it and correct it, never hidden from them. A profile is made again only when the site changes; a correction they made is never overwritten without their yes. It fits in 65,535 bytes, the size of a long Ghost custom field.

## By hand, with any AI

[profile-instructions.txt](profile-instructions.txt) are the instructions to paste into any AI chat with the home page and `/llms-full.txt`. Then do the checks above yourself. The [tutorial](../docs/ask-an-ai.md) shows how.
