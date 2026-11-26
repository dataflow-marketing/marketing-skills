// Works out what adding a store, a binding or both would change in settings, before anything is written.
// Settings must be there and read with no problems: a site skill starts them. A line already there is left alone;
// a different line of the same name is refused: changing a store or moving an object is not adding one.
// The rest connector is refused until it is built.

import { parseSettings } from "@dataflow-marketing/core";
import type { Settings } from "@dataflow-marketing/core";
import { findPlace } from "@dataflow-marketing/store";

export type StoreRequest = {
  store: string;
  connector?: string;
  where?: string;
  binding?: { object: string; business: string; place: string };
};

export type AddPlan =
  | { kind: "add"; lines: string[]; append: string }
  | { kind: "already there"; lines: string[] }
  | { kind: "refused"; problem: string };

const NAME = /^[a-z0-9-]+$/;
const BUILT = ["file", "ghost"];

export function planAdd(settingsText: string | undefined, request: StoreRequest): AddPlan {
  if (settingsText === undefined) {
    return refused("There is no settings file yet. Start one by adding a site: dfm-ghost:site-add or dfm-site:site-add.");
  }
  if (!settingsText.startsWith("spec 1")) {
    return refused('The settings file does not start with "spec 1". It may not be a settings file.');
  }
  const { settings, problems } = parseSettings(settingsText);
  if (problems.length > 0) {
    return refused(`Fix the settings file first: ${problems.join("; ")}`);
  }
  if (!NAME.test(request.store)) {
    return refused(`A store's name is lowercase with hyphens: ${request.store}`);
  }
  if (request.connector === undefined && request.binding === undefined) {
    return refused("Name a store to add (--connector and --where), a binding (--object, --business and --place) or both.");
  }

  const storeLine = storeLineFor(settings, request);
  if (!storeLine.ok) {
    return refused(storeLine.problem);
  }
  const bindingLine = bindingLineFor(settings, request);
  if (!bindingLine.ok) {
    return refused(bindingLine.problem);
  }

  const wanted = [storeLine.line, bindingLine.line].filter((line): line is string => line !== undefined);
  const lines = wanted.filter((line) => !hasLine(settingsText, line));
  if (lines.length === 0) {
    return { kind: "already there", lines: wanted };
  }
  return checkedPlan(settingsText, lines, request);
}

type LineResult = { ok: true; line?: string } | { ok: false; problem: string };

// The store line wanted (none when only a binding is added to a store already listed)
function storeLineFor(settings: Settings, request: StoreRequest): LineResult {
  const listed = settings.stores.find((store) => store.name === request.store);
  if (request.connector === undefined) {
    return listed ? { ok: true } : { ok: false, problem: `There is no store called ${request.store}. Add it with --connector and --where.` };
  }
  if (!request.where) {
    return { ok: false, problem: "A store needs --where: a folder for a file store, a Ghost site's name for a Ghost store." };
  }
  if (request.connector === "rest") {
    return { ok: false, problem: "The rest connector is not built yet. Use file or ghost." };
  }
  if (!BUILT.includes(request.connector)) {
    return { ok: false, problem: `dfm does not know the connector ${request.connector}. Use file or ghost.` };
  }
  if (request.connector === "ghost" && !settings.sites.some((site) => site.business === request.where && site.platform === "ghost")) {
    return { ok: false, problem: `Settings have no Ghost site called ${request.where}. Add it with dfm-ghost:site-add first.` };
  }

  const line = `store ${request.store}: ${request.connector} ${request.where}`;
  if (listed && `store ${listed.name}: ${listed.connector} ${listed.where}` !== line) {
    return { ok: false, problem: `Settings already have a different store called ${request.store}. Change it by hand if it is wrong.` };
  }
  return { ok: true, line };
}

function bindingLineFor(settings: Settings, request: StoreRequest): LineResult {
  const binding = request.binding;
  if (binding === undefined) {
    return { ok: true };
  }
  const line = `binding ${binding.object} ${binding.business}: ${request.store} ${binding.place.trim()}`;
  const there = settings.bindings.find((each) => each.object === binding.object && each.business === binding.business);
  if (there && `binding ${there.object} ${there.business}: ${there.store} ${there.place}` !== line) {
    return {
      ok: false,
      problem: `The ${binding.object} of ${binding.business} is already bound: moving it is not adding it. Change the line by hand after moving the object.`,
    };
  }
  return { ok: true, line };
}

// The settings as they would be must read with no problems. A new binding must name a place that can be found.
function checkedPlan(settingsText: string, lines: string[], request: StoreRequest): AddPlan {
  const append = appendAfter(settingsText, lines);
  const after = parseSettings(settingsText + append);
  if (after.problems.length > 0) {
    return refused(`The settings would not read: ${after.problems.join("; ")}`);
  }
  if (request.binding) {
    const place = findPlace(after, request.binding.object, request.binding.business);
    if (!place.ok) {
      return refused(place.problems.join(" "));
    }
  }
  return { kind: "add", lines, append };
}

function hasLine(settingsText: string, line: string): boolean {
  return settingsText.split("\n").some((each) => each.trim() === line);
}

function appendAfter(settingsText: string, lines: string[]): string {
  const added = lines.map((each) => `${each}\n`).join("");
  return settingsText.endsWith("\n") ? added : `\n${added}`;
}

function refused(problem: string): AddPlan {
  return { kind: "refused", problem };
}
