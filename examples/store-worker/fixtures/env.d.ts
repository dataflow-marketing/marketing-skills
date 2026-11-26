// Types for the tests: the bindings the tests get plus the Worker under test
// (so exports.default.fetch is typed).

import type { D1Migration } from "cloudflare:test";

declare global {
  namespace Cloudflare {
    interface Env {
      DB: D1Database;
      STORE_KEY: string;
      MAX_BODY_BYTES: string;
      TEST_MIGRATIONS: D1Migration[];
    }
    interface GlobalProps {
      mainModule: typeof import("../src/index.ts");
    }
  }
}
