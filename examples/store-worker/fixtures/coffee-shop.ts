// The coffee shop example: its ledger is the body the tests keep,
// read word for word from examples/coffee-shop/ledger.txt.

import ledger from "../../coffee-shop/ledger.txt?raw";

export const COFFEE_SHOP_LEDGER: string = ledger;
export const COFFEE_SHOP_ID = "coffee-shop";

// A made up key, set for the tests in vitest.config.ts. It is not a real key.
export const STORE_KEY = "example-store-key";
