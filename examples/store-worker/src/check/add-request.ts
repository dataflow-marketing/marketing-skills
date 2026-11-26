// Checks what comes in to add an object: { id, body }

import * as v from "valibot";
import { objectId } from "./object-id.ts";

export const addRequest = v.object({
  id: objectId,
  body: v.string(),
});
