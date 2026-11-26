// The coffee shop example from spec/settings.md, word for word.
// A test in test/edge checks this still matches the spec.

export const COFFEE_SHOP_SETTINGS = `spec 1
time zone: Australia/Melbourne
week starts: Monday

site coffee-shop: ghost https://coffee-shop.example key in COFFEE_SHOP_GHOST_ADMIN_KEY
site coffee-shop: cloudflare coffee-shop.example key in CLOUDFLARE_API_TOKEN
keys file: ~/.config/dfm/.env
backups: ~/.config/dfm/backups

store notes: file ~/dfm/ledgers
store members: ghost coffee-shop
store api: rest https://api.coffee-shop.example key in COFFEE_SHOP_API_KEY

binding ledger coffee-shop: members owner@coffee-shop.example next
binding profile coffee-shop: members owner@coffee-shop.example context
binding people coffee-shop: notes people/coffee-shop.txt

house rule spelling: Australian English
house rule message length: three sentences at most
house rule avoid: em dashes
`;

// A made up keys file for the coffee shop. None of these is a real key.
export const COFFEE_SHOP_KEYS = `# the coffee shop's keys (made up)
# OLD_KEY=old
COFFEE_SHOP_GHOST_ADMIN_KEY=example-id:example-secret
export CLOUDFLARE_API_TOKEN="example-cloudflare-token" # the token from the dashboard
COFFEE_SHOP_API_KEY='example-api-key'
EMPTY_KEY=
NOTED_KEY=example-noted # added in November
`;
