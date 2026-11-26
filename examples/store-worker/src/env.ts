// What the Worker is given by Cloudflare: the D1 database, the store key
// (a secret) and the size limit (a variable in wrangler.toml).

export type Env = {
  DB: D1Database;
  STORE_KEY: string;
  MAX_BODY_BYTES: string;
};

export type StoreApp = {
  Bindings: Env;
};
