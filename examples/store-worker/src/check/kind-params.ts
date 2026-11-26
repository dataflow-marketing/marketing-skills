// Checks the path of a request about a kind of object: /objects/:kind

import * as v from "valibot";
import { KINDS } from "./kinds.ts";

export const kindParams = v.object({
  kind: v.picklist(KINDS),
});
