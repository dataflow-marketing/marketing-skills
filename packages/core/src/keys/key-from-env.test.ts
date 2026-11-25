import { describe, expect, it } from "vitest";
import { MissingKeyError } from "./find-key.ts";
import { keyFromEnv } from "./key-from-env.ts";

describe("keyFromEnv, the Worker version", () => {
  it("reads a key from a Worker's env", () => {
    const env = { COFFEE_SHOP_API_KEY: "example-api-key", FILES: {} };
    expect(keyFromEnv(env, "COFFEE_SHOP_API_KEY")).toBe("example-api-key");
  });

  it("refuses a binding that is not text", () => {
    const env = { FILES: {} };
    expect(() => keyFromEnv(env, "FILES")).toThrow(MissingKeyError);
  });
});
