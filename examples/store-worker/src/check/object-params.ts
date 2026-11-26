// Checks the path of a request about one object: /objects/:kind/:id

import * as v from "valibot";
import { KINDS } from "./kinds.ts";
import { objectId } from "./object-id.ts";

export const objectParams = v.object({
  kind: v.picklist(KINDS),
  id: objectId,
});
