// Turns store-add's flags into a request: a store, a binding or both. A binding needs all three of its flags.

import type { StoreRequest } from "./plan-add.ts";

export type RequestResult = { ok: true; request: StoreRequest } | { ok: false; problem: string };

export function readRequest(values: Record<string, string>): RequestResult {
  const request: StoreRequest = { store: values["--store"] };
  if (values["--connector"] !== undefined) {
    request.connector = values["--connector"];
    request.where = values["--where"];
  } else if (values["--where"] !== undefined) {
    return { ok: false, problem: "--where goes with --connector." };
  }

  const bindingFlags = [values["--object"], values["--business"], values["--place"]];
  const given = bindingFlags.filter((value) => value !== undefined).length;
  if (given === 3) {
    request.binding = { object: values["--object"], business: values["--business"], place: values["--place"] };
  } else if (given > 0) {
    return { ok: false, problem: "A binding needs --object, --business and --place." };
  }
  return { ok: true, request };
}
