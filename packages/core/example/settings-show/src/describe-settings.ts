// Turns read settings into what settings-show prints: text for a person, data for --json.

import type { ScriptResult, SettingsResult } from "../../../src/index.ts";

export function describeSettings(result: SettingsResult): ScriptResult {
  const { settings, problems } = result;
  const lines: string[] = [];

  lines.push(`time zone: ${settings.timeZone ?? "not set"}`);
  lines.push(`week starts: ${settings.weekStarts}`);

  for (const site of settings.sites) {
    lines.push(`site ${site.business}: ${site.platform} ${site.address}`);
  }
  for (const store of settings.stores) {
    lines.push(`store ${store.name}: ${store.connector} ${store.where}`);
  }
  for (const binding of settings.bindings) {
    lines.push(`binding ${binding.object} ${binding.business}: ${binding.store} ${binding.place}`);
  }
  for (const problem of problems) {
    lines.push(`problem: ${problem}`);
  }

  return { text: lines.join("\n"), data: result };
}
