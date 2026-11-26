// Each test sits beside the file it tests, named <file>.test.ts (<file>.node.test.ts when it needs Node).
// Two kinds of test:
// work: each skill's work modules, run inside workerd the way a Worker runs them. A passing work test does not
//   prove a module has no Node API: the guards for that are `pnpm typecheck` and skills.node.test.ts
// edge: each skill's Node edges (src/node), every .node.test.ts (the built scripts, the guard, the fixtures),
//   run in Node

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
          include: ["skills/*/src/**/*.test.ts"],
          exclude: ["skills/*/src/node/**", "**/*.node.test.ts", "**/node_modules/**"],
          pool: cloudflarePool(workerOptions),
        },
      },
      {
        test: {
          name: "edge",
          include: ["skills/*/src/node/**/*.test.ts", "**/*.node.test.ts"],
          exclude: ["**/node_modules/**"],
          environment: "node",
        },
      },
    ],
  },
});
