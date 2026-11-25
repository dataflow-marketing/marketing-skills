// Each test sits beside the file it tests, named <file>.test.ts. Two kinds of test:
// work: the work modules, run inside workerd the way a Worker runs them. The pool turns some Node flags on for the
//   runner itself: a passing work test does not prove a module has no Node API. The guards for that are
//   `pnpm typecheck` (tsconfig.work.json has no Node types) and src/index.test.ts
// edge: the Node edges (src/node), the build (src/build), the guard for index.ts, the fixture and each example's build,
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
          include: ["src/**/*.test.ts", "example/*/src/**/*.test.ts"],
          exclude: ["src/node/**", "src/build/**", "src/index.test.ts"],
          pool: cloudflarePool(workerOptions),
        },
      },
      {
        test: {
          name: "edge",
          include: [
            "src/node/**/*.test.ts",
            "src/build/**/*.test.ts",
            "src/index.test.ts",
            "fixtures/**/*.test.ts",
            "example/*/build.test.ts",
          ],
          environment: "node",
        },
      },
    ],
  },
});
