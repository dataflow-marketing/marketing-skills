// Checks what was asked for before anything is written: the name is lowercase with hyphens and the address is an
// https:// address (or http://localhost for a site on this computer, such as a demo). Gives back the site as settings will hold it, with the address tidied. A public site has no key.

import type { Site } from "@dataflow-marketing/core";
import { isLocalAddress } from "@dataflow-marketing/core";
import { PUBLIC } from "./site-line.ts";

export type SiteCheck = { ok: true; site: Site } | { ok: false; problems: string[] };

const NAME = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function checkSite(name: string, address: string): SiteCheck {
  const problems: string[] = [];

  if (!NAME.test(name)) {
    problems.push(`The name ${name} must be lowercase letters, numbers and hyphens, such as coffee-shop.`);
  }

  const tidyAddress = tidyHttpsAddress(address);
  if (!tidyAddress) {
    problems.push(`The address ${address} must look like https://coffee-shop.example (or http://localhost:4101 for a site on this computer): a host and nothing secret.`);
  }

  if (problems.length > 0 || !tidyAddress) {
    return { ok: false, problems };
  }
  return { ok: true, site: { business: name, platform: PUBLIC, address: tidyAddress } };
}

// An https address with a host, no user or password, no query and no fragment.
// The last slash is taken off: https://coffee-shop.example/ becomes https://coffee-shop.example
function tidyHttpsAddress(address: string): string | undefined {
  let url: URL;
  try {
    url = new URL(address);
  } catch {
    return undefined;
  }
  if (url.protocol !== "https:" && !isLocalAddress(url)) {
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
