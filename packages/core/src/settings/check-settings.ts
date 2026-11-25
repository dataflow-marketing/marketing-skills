// Checks settings that were read without a problem but would still break a skill (spec/settings.md, rules).
// Pure: takes the settings, gives back the problems. Each problem names what is wrong, never a value that could
// be a key.

import type { Settings } from "./types.ts";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function checkSettings(settings: Settings): string[] {
  return [
    ...checkTimeZone(settings),
    ...checkWeekStarts(settings),
    ...checkBindings(settings),
  ];
}

// The time zone is required: weeks and days are counted in it
function checkTimeZone(settings: Settings): string[] {
  if (!settings.timeZone) {
    return ["time zone: missing (it is required)"];
  }
  if (!isKnownTimeZone(settings.timeZone)) {
    return ["time zone: not a known time zone (for example Australia/Melbourne)"];
  }
  return [];
}

// Intl knows every time zone, in Node and in a Worker; it throws on one it does not know
function isKnownTimeZone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat("en", { timeZone });
    return true;
  } catch {
    return false;
  }
}

function checkWeekStarts(settings: Settings): string[] {
  if (DAYS.includes(settings.weekStarts)) {
    return [];
  }
  return ["week starts: not a day of the week (for example Monday)"];
}

// Every binding names a store that is listed
function checkBindings(settings: Settings): string[] {
  const listed = new Set(settings.stores.map((store) => store.name));
  const problems: string[] = [];
  for (const binding of settings.bindings) {
    if (!listed.has(binding.store)) {
      problems.push(`binding ${binding.object} ${binding.business}: the store "${binding.store}" is not listed`);
    }
  }
  return problems;
}
