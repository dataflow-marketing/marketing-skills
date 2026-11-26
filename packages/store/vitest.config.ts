// Each test sits beside the file it tests, named <file>.test.ts (<file>.node.test.ts when it needs Node).
// Two kinds of test:
// work: the version, where an object lives, the Ghost calls and the write decisions, run inside workerd the way a
//   Worker runs them. A passing work test does not prove a module has no Node API: the guards for that are
//   `pnpm typecheck` and src/index.test.ts
// edge: the guard for index.ts and the Node edges in src/node (files and backups), run in Node

import { cloudflarePool, cloudflareTest } from "@cloudflare/vitest-pool-workers";
import { defineConfig } from "vitest/config";

const workerOptions = {
  miniflare: {
    compatibilityDate: "2026-03-17",
  },
};

export default defineConfig({
  test: {
    projects: [
      {
        plugins: [cloudflareTest(workerOptions)],
        test: {
          name: "work",
          include: ["src/**/*.test.ts"],
          exclude: ["src/index.test.ts", "src/node/**", "**/*.node.test.ts"],
          pool: cloudflarePool(workerOptions),
        },
      },
      {
        test: {
          name: "edge",
          include: ["src/index.test.ts", "src/node/**/*.test.ts", "**/*.node.test.ts"],
          exclude: ["**/node_modules/**"],
          environment: "node",
        },
      },
    ],
  },
});
