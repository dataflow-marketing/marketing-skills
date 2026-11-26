// Makes route handlers that know the Worker's Env. Each route can live in its own file.

import { createFactory } from "hono/factory";
import type { StoreApp } from "./env.ts";

export const factory = createFactory<StoreApp>();
