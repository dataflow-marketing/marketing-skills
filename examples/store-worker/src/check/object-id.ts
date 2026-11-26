// An object's id is the business's name from settings, such as coffee-shop: lowercase letters, digits and hyphens.

import * as v from "valibot";

export const objectId = v.pipe(v.string(), v.regex(/^[a-z0-9-]{1,200}$/, "an id is a business's name: lowercase with hyphens"));
