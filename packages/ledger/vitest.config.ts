// Each test sits beside the file it tests, named <file>.test.ts (<file>.node.test.ts when it needs Node).
// Two kinds of test:
// work: the reader, carry forward and the forecast, run inside workerd the way a Worker runs them. A passing work
//   test does not prove a module has no Node API: the guards for that are `pnpm typecheck` and src/index.test.ts
// edge: the guard for index.ts and every .node.test.ts (the parser is what its grammar builds), run in Node

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
          include: ["src/**/*.test.ts", "build/**/*.test.ts"],
          exclude: ["src/index.test.ts", "**/*.node.test.ts", "build/**"],
          pool: cloudflarePool(workerOptions),
        },
      },
      {
        test: {
          name: "edge",
          include: ["src/index.test.ts", "**/*.node.test.ts"],
          exclude: ["**/node_modules/**"],
          environment: "node",
        },
      },
    ],
  },
});
