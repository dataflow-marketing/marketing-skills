// Checks what comes in to change an object: { body }

import * as v from "valibot";

export const changeRequest = v.object({
  body: v.string(),
});
