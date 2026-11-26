# The starter store Worker

A small Cloudflare Worker that keeps a business's objects (a ledger, a profile, a people list, a forecast) in a D1 database. It meets the REST contract in [spec/store.md](../../spec/store.md): the `rest` connector of the dfm-store skills reads and writes through it.

It is an example, not a skill. Copy it, read it and change it to suit you.

## What it answers

```
GET    /objects/:kind              [{ id, version, updated }]
GET    /objects/:kind/:id          { id, version, body }
POST   /objects/:kind              { id, body }               answers 201 { id, version }
PUT    /objects/:kind/:id          { body } with If-Match     answers 200 { id, version }
DELETE /objects/:kind/:id          with If-Match              answers 204
GET    /limits                     { bytes }
Authorization: Bearer <key>        on every request
```

| Answer | When |
|---|---|
| 400 | an unknown kind, an id that is not a business's name (lowercase with hyphens) or a body that is not the JSON above |
| 401 | no key or the wrong key; nothing is read or written |
| 404 | no such object; a path outside the contract |
| 409 | a change or remove with an old version; an add over an object already kept; nothing is written |
| 413 | a body larger than the limit; nothing is written |
| 428 | a change or remove with no If-Match; nothing is written |

**The version** is a new random id (a UUID) on every write, never a hash of the body. Writing the same text again still gives a new version; an object removed and added again never gets an old version back. The version check and the write are one SQL statement: two writers cannot both win.

**The key** is compared in constant time: both keys are hashed with SHA-256, then compared with `crypto.subtle.timingSafeEqual`.

## How it is built

[Hono](https://hono.dev) is the routing layer, [valibot](https://valibot.dev) checks what comes in and [drizzle](https://orm.drizzle.team) reads and writes D1. [src/index.ts](src/index.ts) reads like an outline: the key check, then one line for each route.

| Folder | What is in it |
|---|---|
| `src/routes` | one small handler for each route: it checks what came in, calls a work module and turns the result into an answer |
| `src/check` | the valibot shapes of what comes in |
| `src/work` | the work: one job for each file, such as `change-object.ts` or `key-matches.ts` |
| `src/db` | the drizzle table and the database it opens |
| `migrations` | the D1 table: `kind`, `id`, `version`, `updated`, `body` |
| `fixtures` | what the tests share: the coffee shop ledger, a way to send a request, the table made before each run |

Each test sits beside the file it tests. [src/index.test.ts](src/index.test.ts) runs the whole contract; [src/index.rest-connector.test.ts](src/index.rest-connector.test.ts) runs the dfm-store `rest` connector against this Worker.

## Run its tests

From the root of the repo:

```
pnpm install
pnpm --filter @dataflow-marketing/store-worker test
```

The tests run the Worker inside workerd, the runtime Cloudflare uses, with a local D1 database that lives only for the test run. They need no Cloudflare account and send nothing over the network. The coffee shop's [ledger](../coffee-shop/ledger.txt) is the body they keep.

## Run it on your computer

Wrangler keeps a local D1 database in `.wrangler/` (never committed). Nothing reaches a Cloudflare account.

1. Choose a key for your own computer and put it in `examples/store-worker/.dev.vars` (never committed):

   ```
   STORE_KEY=a-long-random-key-for-your-computer
   ```

2. From the root of the repo, make the local table and start the Worker:

   ```
   pnpm --filter @dataflow-marketing/store-worker dev
   ```

   It answers at `http://localhost:8787`.

3. Point the skills at it. Put the same key in your keys file (`LOCAL_STORE_KEY=...`), then in settings:

   ```
   store local: rest http://localhost:8787 key in LOCAL_STORE_KEY
   binding ledger coffee-shop: local coffee-shop
   ```

   The place in a `rest` binding is the object's id: the business's name. `dfm-store:store-check` proves it can be read. A `rest` store must be `https://`, except on `localhost` or `127.0.0.1`.

## Deploy your own

This is what you would do with your own Cloudflare account. Nothing in this repo has done it.

1. Log in to your account: `pnpm wrangler login`.
2. Make the database: `pnpm wrangler d1 create store`. Put the id it prints in `wrangler.toml` in place of the placeholder `database_id`.
3. Make the table: `pnpm wrangler d1 migrations apply store --remote`.
4. Choose a long random key and keep it in your keys file. Give it to the Worker as a secret: `pnpm wrangler secret put STORE_KEY`.
5. Change `MAX_BODY_BYTES` in `wrangler.toml` if you want a different limit. D1 keeps a value of up to 2,000,000 bytes.
6. Deploy: `pnpm wrangler deploy`. Wrangler prints the Worker's address.
7. In your settings, add a `rest` store with that address and the name of the key in your keys file, with `dfm-store:store-add`:

   ```
   store api: rest https://store-worker.<your account>.workers.dev key in COFFEE_SHOP_STORE_KEY
   ```

Keep the key out of `wrangler.toml` and out of git. Anyone with the key can read and change every object.
