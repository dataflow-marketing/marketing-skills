// Adds one settings line to the settings, by its kind.
// Each kind of line has a name and a way to add it. The first kind that fits the line is used.

import {
  readBindingLine,
  readHouseRuleLine,
  readSiteLine,
  readStoreLine,
  readValueAfter,
} from "./read-line.ts";
import type { Settings } from "./types.ts";

type LineKind = {
  name: string;
  addTo: (settings: Settings, line: string) => boolean;
};

export const LINE_KINDS: LineKind[] = [
  { name: "time zone", addTo: addTimeZone },
  { name: "week starts", addTo: addWeekStarts },
  { name: "keys file", addTo: addKeysFile },
  { name: "backups", addTo: addBackups },
  { name: "site", addTo: addSite },
  { name: "store", addTo: addStore },
  { name: "binding", addTo: addBinding },
  { name: "house rule", addTo: addHouseRule },
  { name: "own email", addTo: addOwnEmail },
];

// Gives back the kind of line that was added (undefined when no kind fits the line)
export function addLine(settings: Settings, line: string): string | undefined {
  for (const kind of LINE_KINDS) {
    if (kind.addTo(settings, line)) {
      return kind.name;
    }
  }
  return undefined;
}

// ---- each kind: true when the line fits and was added ----

function addTimeZone(settings: Settings, line: string): boolean {
  const timeZone = readValueAfter("time zone:", line);
  if (timeZone === undefined) {
    return false;
  }
  settings.timeZone = timeZone;
  return true;
}

function addWeekStarts(settings: Settings, line: string): boolean {
  const weekStarts = readValueAfter("week starts:", line);
  if (weekStarts === undefined) {
    return false;
  }
  settings.weekStarts = weekStarts;
  return true;
}

function addKeysFile(settings: Settings, line: string): boolean {
  const keysFile = readValueAfter("keys file:", line);
  if (keysFile === undefined) {
    return false;
  }
  settings.keysFile = keysFile;
  return true;
}

function addBackups(settings: Settings, line: string): boolean {
  const backups = readValueAfter("backups:", line);
  if (backups === undefined) {
    return false;
  }
  settings.backups = backups;
  return true;
}

function addSite(settings: Settings, line: string): boolean {
  const site = readSiteLine(line);
  if (site === undefined) {
    return false;
  }
  settings.sites.push(site);
  return true;
}

function addStore(settings: Settings, line: string): boolean {
  const store = readStoreLine(line);
  if (store === undefined) {
    return false;
  }
  settings.stores.push(store);
  return true;
}

function addBinding(settings: Settings, line: string): boolean {
  const binding = readBindingLine(line);
  if (binding === undefined) {
    return false;
  }
  settings.bindings.push(binding);
  return true;
}

function addHouseRule(settings: Settings, line: string): boolean {
  const houseRule = readHouseRuleLine(line);
  if (houseRule === undefined) {
    return false;
  }
  settings.houseRules.push(houseRule);
  return true;
}

// own email: owner@coffee-shop.example (one address a line; never counted as a new member or as audience)
function addOwnEmail(settings: Settings, line: string): boolean {
  const email = readValueAfter("own email:", line);
  if (email === undefined || !/^\S+@\S+$/.test(email)) {
    return false;
  }
  settings.ownEmails.push(email.toLowerCase());
  return true;
}
