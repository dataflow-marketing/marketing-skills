# Settings (spec 1, draft)

Everything personal lives here, never in a skill: a user's sites, where their keys are kept, their stores, which object lives where, their time zone and their house rules. Each user has one settings file, kept outside any repo they share.

## The shape

```
spec 1
time zone: Australia/Melbourne
week starts: Monday

site coffee-shop: ghost https://coffee-shop.example key in COFFEE_SHOP_GHOST_ADMIN_KEY
site coffee-shop: cloudflare coffee-shop.example key in CLOUDFLARE_API_TOKEN
keys file: ~/.config/dfm/.env

store notes: file ~/dfm/ledgers
store members: ghost coffee-shop
store api: rest https://api.coffee-shop.example key in COFFEE_SHOP_API_KEY

binding ledger coffee-shop: members field next
binding profile coffee-shop: members field context
binding people coffee-shop: notes people/coffee-shop.txt

house rule spelling: Australian English
house rule message length: three sentences at most
house rule avoid: em dashes
```

## Lines

| Line | Says |
|---|---|
| `time zone` | the business's time zone; weeks and days are counted in it |
| `week starts` | the day a week starts (Monday by default) |
| `site <name>: <platform> <address> key in <NAME>` | a site on a platform and the name of the variable that holds its key |
| `keys file` | the file the keys are read from |
| `store <name>: <connector> <where>` | a [store](store.md) and its connector: file, ghost or rest |
| `binding <object> <business>: <store> <place>` | which store holds which object for which business |
| `house rule <name>: <rule>` | a rule every words skill applies and checks after |

## Rules

1. **Keys are never in settings.** Settings names the variable; the key is in the keys file, added through a hidden prompt, never pasted into a chat.
2. **One name per business,** lowercase with hyphens, used for its site, its ledger and its bindings.
3. **Moving an object to another store changes its binding line only.**
