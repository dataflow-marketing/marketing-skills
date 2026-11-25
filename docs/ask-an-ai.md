# Tutorial: ask an AI about your marketing plan

You can use dataflow marketing today with any AI chat (ChatGPT, Gemini, the Claude app). Nothing to install. You paste one piece of text: instructions, what your website says and your plan. The AI then leads you one choice at a time and ends with changes you decide whether to make.

## Part 1: try it with the coffee shop

1. Open [examples/coffee-shop/ask-ai-copy.txt](../examples/coffee-shop/ask-ai-copy.txt) and copy all of it.
2. Paste it into a new chat in ChatGPT or any AI chat. Send it.
3. The AI should reply in a few lines: where the coffee shop is against its goal of 10 stamp cards a week, using the numbers in the summary (6 and 9, an average of 7.5). Then numbered choices, the first always "Top 3 quick wins".
4. Answer with a number. Keep going. Each reply after the first starts with its round, `Round 2 of 7` and so on.
5. It ends with a short email: `Change:` lines and one sentence on why.

**What good looks like:**

- Every number comes from the summary. It never works out its own.
- It says "not known yet" for anything not counted, never 0.
- It asks for your words before it writes a post or a message, then polishes them. It never makes up a quote.
- It never says something was sent or done.

If it drifts, say: "Follow the instructions at the top."

## Part 2: do it yourself

Make the same copy for your own business. Plain text in any editor is enough.

### 1. Write your plan

Start from the [starter plan](../examples/starter/README.md): copy its ledger and change the dates to yours. Later, the [coffee shop's ledger](../examples/coffee-shop/ledger.txt) shows where a plan can grow. Keep the four parts. The [ledger spec](../spec/ledger.md) lists every kind of line.

- **graph:** what you count (`fact`) and what you believe leads to what (`->`). If you have never counted a link, its rate is `?`.
- **plan:** your goal as a number a week (`want new customers 2 a week by 2027-03-31`) and your steps (`every week new post`). Add a `how` line to say what each step involves.
- **done:** each week, under its Monday, the steps you did and your counts (`2026-11-30 fact count visits: 560`).
- **summary:** add up your counts and write the lines yourself, as in the example. Mark each one `calculated`. Leave the forecast out: it is worked out by code, as the [forecast spec](../spec/forecast.md) shows. Check every sum twice: the AI trusts these numbers.

Use names for groups (`Regulars`), never people's names.

### 2. Summarise your website

Your profile is a summary of what your website says and how it says it. An AI writes it from your site's own text; you check it.

1. Copy [spec/profile-instructions.txt](../spec/profile-instructions.txt).
2. Under "home page", paste the text of your home page.
3. Under "pages and posts", paste your site's `/llms-full.txt` (open `https://your-site/llms-full.txt`; many site builders can turn it on). If your site has none, paste the text of your main pages.
4. Paste it all into a new AI chat. It writes the profile in fourteen parts plus "how they write".
5. **Check it against your site.** Search your site for every sentence under "how they write": each must be there word for word. Check every name, number and price. Read every other sentence: is it on your site? Remove anything that is not. Do not reword it: a reworded invention is still an invention.
6. Put `=== their website ===` at the top. The [coffee shop's profile](../examples/coffee-shop/profile.txt) shows the finished shape. The [profile spec](../spec/profile.md) says what each part holds.

### 3. Fill in the instructions

Copy [spec/ask-ai-instructions.txt](../spec/ask-ai-instructions.txt). Replace the two blanks:

- `{who}`: your business's name
- `{send to}`: where the changes go. If you keep the plan yourself, your own email address works.

Change nothing else. The instructions are what make the AI behave.

### 4. Put the copy together

One text, in this order:

```
the instructions (from step 3)

the profile (from step 2, starting with its "=== their website ===" line)

=== their plan ===
your ledger (from step 1)
```

### 5. Ask

Paste it into a new chat. Answer with numbers. Pick "Top 3 quick wins" if you want something to do this week.

### 6. Make the changes yourself

When the AI gives you `Change:` lines, read each one. Keep the ones you want. For each one you keep, take off `Change:` and add the line to your ledger, in its part: a step to the plan, a `->` to the graph, a `said` line to done.

You decide. The AI only suggests.

### 7. Next week

Add the week's counts and ticks under its Monday. Write the summary again. Paste the new copy into a new chat. Each week your plan rests on more counts than the last.

## When the skills are built

The skills do the steps above for you: `/dfm-ledger:askai-make` puts the copy together with a summary worked out from your lines, `/dfm-ledger:plan-change` applies the `Change:` lines after a yes. Until then, this tutorial is the whole method by hand.
