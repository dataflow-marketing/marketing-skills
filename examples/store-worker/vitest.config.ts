// The tests run the Worker the way Cloudflare runs it: inside workerd, with a local D1 database that only lives
// for the test run. Nothing here reaches a Cloudflare account.
// Each test sits beside the file it tests, named <file>.test.ts.

import { cloudflarePool, cloudflareTest, readD1Migrations } from "@cloudflare/vitest-pool-workers";
import { defineConfig } from "vitest/config";

const migrations = await readD1Migrations("./migrations");

const workerOptions = {
  main: "./src/index.ts",
  wrangler: { configPath: "./wrangler.toml" },
  miniflare: {
    bindings: {
      STORE_KEY: "example-store-key",
      TEST_MIGRATIONS: migrations,
    },
  },
};

export default defineConfig({
  plugins: [cloudflareTest(workerOptions)],
  test: {
    include: ["src/**/*.test.ts"],
    setupFiles: ["./fixtures/apply-migrations.ts"],
    pool: cloudflarePool(workerOptions),
  },
});
