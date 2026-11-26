// The coffee shop: made up, like everything in examples/coffee-shop.
// No address here is a real site and no key is a real key.

// A made up Ghost Admin API key in Ghost's form: a 24 hex character id, a colon,
// then a 64 hex character secret.
export const COFFEE_SHOP_KEY_ID = "c0ffeec0ffeec0ffeec0ffee";
export const COFFEE_SHOP_KEY_SECRET = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
export const COFFEE_SHOP_ADMIN_KEY = `${COFFEE_SHOP_KEY_ID}:${COFFEE_SHOP_KEY_SECRET}`;

export const COFFEE_SHOP_ADDRESS = "https://coffee-shop.example";
export const COFFEE_SHOP_KEY_NAME = "COFFEE_SHOP_GHOST_ADMIN_KEY";
export const COFFEE_SHOP_SITE_LINE = `site coffee-shop: ghost ${COFFEE_SHOP_ADDRESS} key in ${COFFEE_SHOP_KEY_NAME}`;

export const COFFEE_SHOP_SITE = {
  business: "coffee-shop",
  platform: "ghost",
  address: COFFEE_SHOP_ADDRESS,
  keyName: COFFEE_SHOP_KEY_NAME,
};

// Settings for the coffee shop, with the keys file wherever a test keeps it.
export function coffeeShopSettings(keysFile: string): string {
  return `spec 1
time zone: Australia/Melbourne
week starts: Monday

${COFFEE_SHOP_SITE_LINE}
keys file: ${keysFile}

house rule spelling: Australian English
`;
}

export const COFFEE_SHOP_KEYS = `# the coffee shop's keys (made up)
${COFFEE_SHOP_KEY_NAME}=${COFFEE_SHOP_ADMIN_KEY}
`;

// Sam's recording, as a transcript: the source the post is made from.
export const SAM_TRANSCRIPT = `Sam: Okay. The post for this week.
Sam: The first hot morning always brings the same question at the counter.
Sam: And yes, iced coffee is back from Monday.
Sam: With cake from the bakery next door.
`;

// The words file from spec/words.md, made from Sam's recording.
export const ICED_COFFEE_WORDS = `spec 1
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
tags: menu, summer
=== body ===
The first hot morning always brings the same question at the counter.

Iced coffee is back from Monday.
`;

// A quotes-check report that passed for the words file above.
export const PASSED_REPORT = `spec 1
checked: drafts/iced-coffee.txt
against: recordings/2026-11-28-sam.txt
result: passed

name found: Monday (line 3)
`;

// A quotes-check report that found problems in it.
export const FAILED_REPORT = `spec 1
checked: drafts/iced-coffee.txt
against: recordings/2026-11-28-sam.txt
result: 1 problem

name not found: Sam
`;
