// Reads one settings line into its parts.
// Each function takes one whole line and gives back its parts (undefined
// when the line does not have the expected shape).

import type { Binding, HouseRule, Site, Store } from "./types.ts";

// site <business>: <platform> <address> key in <NAME>
// site coffee-shop: ghost https://coffee-shop.example key in COFFEE_SHOP_GHOST_ADMIN_KEY
const SITE_LINE = /^site ([a-z0-9-]+): (\S+) (\S+) key in (\S+)$/;

// store <name>: <connector> <where> [key in <NAME>]
// store api: rest https://api.coffee-shop.example key in COFFEE_SHOP_API_KEY
const STORE_LINE = /^store ([a-z0-9-]+): (\S+) (.+?)(?: key in (\S+))?$/;

// binding <object> <business>: <store> <place>
// binding ledger coffee-shop: members field next
const BINDING_LINE = /^binding (\S+) ([a-z0-9-]+): (\S+) (.+)$/;

// house rule <name>: <rule>
// house rule message length: three sentences at most
const HOUSE_RULE_LINE = /^house rule (.+?): (.+)$/;

export function readSiteLine(line: string): Site | undefined {
  const match = SITE_LINE.exec(line);
  if (!match) {
    return undefined;
  }
  return {
    business: match[1],
    platform: match[2],
    address: match[3],
    keyName: match[4],
  };
}

export function readStoreLine(line: string): Store | undefined {
  const match = STORE_LINE.exec(line);
  if (!match) {
    return undefined;
  }
  const store: Store = {
    name: match[1],
    connector: match[2],
    where: match[3],
  };
  if (match[4]) {
    store.keyName = match[4];
  }
  return store;
}

export function readBindingLine(line: string): Binding | undefined {
  const match = BINDING_LINE.exec(line);
  if (!match) {
    return undefined;
  }
  return {
    object: match[1],
    business: match[2],
    store: match[3],
    place: match[4],
  };
}

export function readHouseRuleLine(line: string): HouseRule | undefined {
  const match = HOUSE_RULE_LINE.exec(line);
  if (!match) {
    return undefined;
  }
  return {
    name: match[1],
    rule: match[2],
  };
}

// For the simple lines: "time zone: Australia/Melbourne" gives "Australia/Melbourne".
export function readValueAfter(prefix: string, line: string): string | undefined {
  if (!line.startsWith(prefix)) {
    return undefined;
  }
  const value = line.slice(prefix.length).trim();
  if (value === "") {
    return undefined;
  }
  return value;
}
