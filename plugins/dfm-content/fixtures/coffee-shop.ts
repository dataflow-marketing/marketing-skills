// The coffee shop: made up, like everything in examples/coffee-shop.
// COFFEE_SHOP_PROFILE is examples/coffee-shop/profile.txt word for word:
// a test in test/edge checks it still matches.
// COFFEE_SHOP_SITE is the made up site the profile is read from: its pages and posts
// as /llms-full.txt would give them. COFFEE_SHOP_COUNTS are the lines counted by code.

export const COFFEE_SHOP_PROFILE = `spec 1
=== their website ===
(Made up for this example: the coffee shop and its website are not real. A real profile is summarised from the business's own home page and /llms-full.txt, then checked against them.)

=== counted ===
pages: 3, posts: 4 (in /llms-full.txt)
words per post: about 40 on average, 25 to 60
most read, 23 to 29 Nov 2026: "the home page" 120; "Iced coffee is back" 45; "Stamp card" 18

=== read from the site ===
what the site is and who it is for:
The coffee shop's website is a small site for a takeaway coffee shop. It is for people who pass by on the way to work and for regulars who want to know what is new.

who is behind it:
The site speaks as "we", the people behind the counter. It names no owner and no staff.

who they speak to:
The site speaks to people on their way to work and to regulars. It names no other audience.

what it offers:
It offers takeaway coffee from 6.30 every morning, cake from the bakery next door and a stamp card. The stamp card page says the tenth coffee is free.

what they believe:
The site puts a quick, friendly coffee first. It treats regulars as people it knows, with posts about what is new rather than about prices.

kinds of content and their shapes:
There are three pages and four short posts. Each post is one or two sentences under a photo, about something new on the menu.

how titles and headlines are written:
Titles are short statements of what is new, such as "Iced coffee is back". They name the thing and nothing else.

how it is said:
The tone is short, friendly and plain. Sentences are brief and speak to the reader directly.

how they write:
"Iced coffee is back from Monday." [Iced coffee is back]
"The first hot morning always brings the same question at the counter." [Iced coffee is back]
"We open at 6.30 every morning." [Home]
"Ask for a stamp card with your first coffee." [Home]
"The tenth coffee is on us." [Stamp card]
"Cake comes from the bakery next door, fresh each morning." [Home]

words and phrases they use:
The site uses "regulars", "the counter" and "on us". It calls the loyalty card a "stamp card".

themes they come back to:
What is new on the menu and the stamp card come up again and again. The counter is where things happen.

channels and tools they mention:
The site mentions its Instagram account. It mentions no other channel.

proof they show:
The site shows no testimonials or reviews. Its proof is its posts about the menu.

questions the site answers:
The site answers when the shop opens, what is new this week and how the stamp card works.

what it asks readers to do:
It asks readers to take a stamp card and to follow the shop on Instagram.
`;

export const COFFEE_SHOP_SITE = `# Home
URL: https://coffee-shop.example/

We open at 6.30 every morning. Takeaway coffee for the walk to work and a hello for our regulars.

Cake comes from the bakery next door, fresh each morning.

Ask for a stamp card with your first coffee. Follow us on Instagram for what is new.

# Stamp card
URL: https://coffee-shop.example/stamp-card/

One stamp for every coffee. The tenth coffee is on us.

# Menu
URL: https://coffee-shop.example/menu/

Coffee, tea and cake from the bakery next door. Ask at the counter for one or two shots.

# Iced coffee is back
URL: https://coffee-shop.example/iced-coffee/

The first hot morning always brings the same question at the counter. Iced coffee is back from Monday.

# Chai is here
URL: https://coffee-shop.example/chai/

Chai is on the menu from today. Ask for it with oat milk.

# Banana bread
URL: https://coffee-shop.example/banana-bread/

Banana bread comes from the bakery next door on Fridays.

# Hot chocolate
URL: https://coffee-shop.example/hot-chocolate/

Hot chocolate is back for the cold mornings.
`;

export const COFFEE_SHOP_COUNTS = `pages: 3, posts: 4 (in /llms-full.txt)
words per post: about 40 on average, 25 to 60
most read, 23 to 29 Nov 2026: "the home page" 120; "Iced coffee is back" 45; "Stamp card" 18
`;

// A draft with one invention of each kind: a quote, a name, a year and a price.
export const DRAFT_WITH_INVENTIONS = `Iced coffee is back from Monday.
Our barista Sam has made it since 1987.
A large iced coffee is $5.50.
"Best iced coffee in town," say our regulars.
`;
