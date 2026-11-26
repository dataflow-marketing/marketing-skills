// A small made up ledger for the coffee shop (in ASCII as spec 1 writes it) and settings to check it with.

export const COFFEE_SHOP_LEDGER = `spec 1
=== graph ===
fact visits: told
fact stamp cards started: told
open the cafe -> visits: ? (unknown)
stamp card at the counter -> stamp cards started: 15 of 2,550 visits (believed)
=== plan ===
start 2026-11-16
want stamp cards started 10 a week by 2026-12-31
every week open the cafe from 2026-11-16
every week stamp card at the counter from 2026-11-16
=== done ===
started 2026-11-16
2026-11-16 fact count visits: 1,240
2026-11-16 fact count stamp cards started: 6
`;

export const COFFEE_SHOP_SETTINGS = "spec 1\ntime zone: Australia/Melbourne\nsite coffee-shop: public https://coffee-shop.example\n";
