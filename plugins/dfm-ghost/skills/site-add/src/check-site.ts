// Checks what was asked for before anything is written:
// the name is lowercase with hyphens, the address is an https:// address
// and the key's variable is a NAME, never a key.
// Gives back the site as settings will hold it, with the address tidied.

import type { Site } from "@dataflow-marketing/core";

export type SiteCheck = { ok: true; site: Site } | { ok: false; problems: string[] };

const NAME = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const KEY_NAME = /^[A-Z][A-Z0-9_]*$/;

export function checkSite(name: string, address: string, keyName: string): SiteCheck {
  const problems: string[] = [];

  if (!NAME.test(name)) {
    problems.push(`The name ${name} must be lowercase letters, numbers and hyphens, such as coffee-shop.`);
  }

  const tidyAddress = tidyHttpsAddress(address);
  if (!tidyAddress) {
    problems.push(`The address ${address} must look like https://coffee-shop.example: https, a host and nothing secret.`);
  }

  if (!KEY_NAME.test(keyName)) {
    problems.push("The key's variable must be a NAME in capitals, such as COFFEE_SHOP_GHOST_ADMIN_KEY. Never give the key itself.");
  }

  if (problems.length > 0 || !tidyAddress) {
    return { ok: false, problems };
  }
  return { ok: true, site: { business: name, platform: "ghost", address: tidyAddress, keyName } };
}

// An https address with a host, no user or password, no query and no fragment.
// The last slash is taken off: https://coffee-shop.example/ becomes https://coffee-shop.example
function tidyHttpsAddress(address: string): string | undefined {
  if (!address.startsWith("https://")) {
    return undefined;
  }
  let url: URL;
  try {
    url = new URL(address);
  } catch {
    return undefined;
  }
  if (url.hostname === "" || url.username !== "" || url.password !== "") {
    return undefined;
  }
  if (url.search !== "" || url.hash !== "") {
    return undefined;
  }
  const path = url.pathname.replace(/\/+$/, "");
  return `${url.origin}${path}`;
}
