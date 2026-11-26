---
name: profile-make
description: Make a business's profile, what its website says and how it says it, from the site's own home page and /llms-full.txt (or the pages its sitemap lists), then check it with dfm-content:quotes-check. Use when someone wants an AI to know their business and its voice ("make a profile of my site", "how does my site sound") or as a step of dfm-recipes:client-run.
---

# profile-make

A words skill with a script. The script reads the site and counts it; Claude writes the profile from what was read; `dfm-content:quotes-check` proves it. The shape is [profile](../../../../spec/profile.md).

## 1. Read the site

Ask for the site's address if it is not already known (settings name it for a site added with a `site-add`). Any public site will do, on any platform. From the working folder:

```
node <this skill's folder>/dist/run.js --address <https://...>
```

It reads the home page and the site's `/llms-full.txt`, every page and post as plain text. It keeps them as `site/home.txt` and `site/llms-full.txt` and prints the counted part of the profile. It never writes over files from an earlier read: it names them; the person decides whether to delete them or use `--folder` for a new one.

| Exit code | Means |
|---|---|
| 0 | read and counted |
| 2 | refused or failed: no `/llms-full.txt` (and no `--from-sitemap`), no sitemap either, an address that is not https://, files already there |

**No `/llms-full.txt`:** show what it printed and ask the person which way to go:
- **Turn it on,** where their site builder can (on Ghost it is on unless the site is private or the setting is off), then run this step again.
- **Read the sitemap instead:** run it again with `--from-sitemap`. It reads the pages the site's sitemap lists, up to 50, the same way it reads the home page, into `site/pages.txt`. The counted part then says `(in the sitemap)`.

Never read the site any other way.

## 2. Write the profile

Read all of `site/home.txt` and the pages file (`site/llms-full.txt`; `site/pages.txt` when it came from the sitemap). Write `profile.txt` in the working folder, in the shape of the spec:

```
spec 1
=== their website ===
<one line: whose site this is and its address>

<the counted part, exactly as the script printed it>

=== read from the site ===
what the site is and who it is for:
...
how they write:
"<a sentence, word for word>" [<the page it is from>]
```

- **The fourteen parts** in the spec's order, each a label then plain full sentences, about 1,100 to 1,400 words in all.
- **How they write:** six to eight of their own sentences, chosen, never written. Word for word, each with its page.
- **Only what the site says.** Never where the business is, its currency or what it does not do unless the site says it. A part the site says nothing about says so in one sentence.
- **The counted part is copied, never changed.**
- **Never write over a profile.** If `profile.txt` is there, ask: the person may have corrected it.

## 3. Check it

```
node <quotes-check folder>/dist/run.js --text profile.txt --against site/llms-full.txt --against site/home.txt > profile.check.txt
```

With pages from the sitemap, check against `site/pages.txt` in place of `site/llms-full.txt`. Remove what was not found, never reword it. Run the check again until it says `result: passed`. Show the profile and the passing report. The person reads every word: the check cannot catch a claim with no quote, name or number in it.

## Asking

- **Ask with the question dialog** where there is one: every question and every yes, with options such as "Yes, go on", "Change something" and "Stop". Where there is no dialog, the question is the last line of the message. A question in the middle of a long message is easily missed.
- **Ask for what is missing; never guess it.** When an answer could mean more than one thing, ask which.
- **Its script needs Node 24 or later.** If `node` is not found, ask the person how Node is installed and run the script with that Node.

## Next

The profile is kept in the working folder for now. In `dfm-recipes:client-run`, go back to the recipe's next step. On its own, the profile is ready for any AI: `dfm-recipes:recording-run` turns a recording into a post in the same voice.
