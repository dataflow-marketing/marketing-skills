// Finds the Ghost site to draft on in settings and the keys file its key is in.
// Settings with lines that are not understood are refused: a guardrail never guesses.

import type { SettingsResult, Site } from "@dataflow-marketing/core";

export type GhostSite = {
  site: Site;
  keysFile: string;
};

export type GhostSiteResult = { ok: true; found: GhostSite } | { ok: false; problems: string[] };

export function findGhostSite(read: SettingsResult, name: string): GhostSiteResult {
  if (read.problems.length > 0) {
    return { ok: false, problems: read.problems.map((problem) => `settings ${problem}`) };
  }

  const site = read.settings.sites.find((known) => known.business === name && known.platform === "ghost");
  if (!site) {
    return { ok: false, problems: [`Settings have no Ghost site called ${name}. Add it with dfm-ghost:site-add.`] };
  }
  if (!site.address.startsWith("https://")) {
    return { ok: false, problems: [`The address for ${name} is not https://: ${site.address}`] };
  }
  if (!read.settings.keysFile) {
    return { ok: false, problems: ["Settings name no keys file. Add a line such as: keys file: ~/.config/dfm/.env"] };
  }

  return { ok: true, found: { site, keysFile: read.settings.keysFile } };
}
