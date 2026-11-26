// A made up Ghost Admin API key for the coffee shop, in Ghost's form:
// a 24 hex character id, a colon, then a 64 hex character secret.
// It is not a real key for any site.

export const COFFEE_SHOP_KEY_ID = "c0ffeec0ffeec0ffeec0ffee";
export const COFFEE_SHOP_KEY_SECRET = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
export const COFFEE_SHOP_ADMIN_KEY = `${COFFEE_SHOP_KEY_ID}:${COFFEE_SHOP_KEY_SECRET}`;

// 25 November 2026, 09:00 in Melbourne
export const FIXED_TIME = new Date("2026-11-24T22:00:00Z");
export const FIXED_TIME_IN_SECONDS = Math.floor(FIXED_TIME.getTime() / 1000);
