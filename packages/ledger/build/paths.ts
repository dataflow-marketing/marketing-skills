// Where the grammar is and where its parser is written.

import { fileURLToPath } from "node:url";

export const GRAMMAR = fileURLToPath(new URL("../grammar/lines.peggy", import.meta.url));
export const PARSER = fileURLToPath(new URL("../src/read/lines.js", import.meta.url));
