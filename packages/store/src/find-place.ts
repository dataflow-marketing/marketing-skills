// Finds where an object is kept: its binding in settings, the store it names and that store's connector.
// With no binding the object is a file in the working folder, named after its kind (ledger.txt, profile.txt).
// Pure: takes read settings, gives back the place or every problem. Settings with problems are refused:
// a write to a guessed place could land on the wrong member.

import type { Binding, Settings, SettingsResult, Site, Store } from "@dataflow-marketing/core";

export type FilePlace = { connector: "file"; path: string; label: string };

export type GhostPlace = {
  connector: "ghost";
  site: Site & { keyName: string };
  keysFile: string;
  email: string;
  field: string;
  label: string;
};

export type Place = FilePlace | GhostPlace;

export type PlaceResult = { ok: true; place: Place } | { ok: false; problems: string[] };

const NAME = /^[a-z0-9-]+$/;
const FIELD = /^[A-Za-z0-9_-]+$/;

export function findPlace(read: SettingsResult, object: string, business: string): PlaceResult {
  if (read.problems.length > 0) {
    return refused(read.problems.map((problem) => `settings ${problem}`));
  }
  if (!NAME.test(object) || !NAME.test(business)) {
    return refused([`The object and the business are lowercase names with hyphens: ${object}, ${business}`]);
  }

  const bindings = read.settings.bindings.filter((each) => each.object === object && each.business === business);
  if (bindings.length > 1) {
    return refused([`Settings bind the ${object} of ${business} more than once. Keep one binding line.`]);
  }
  if (bindings.length === 0) {
    return workingFolderFile(object);
  }

  const binding = bindings[0];
  const store = read.settings.stores.find((each) => each.name === binding.store);
  if (!store) {
    return refused([`The store "${binding.store}" is not listed in settings.`]);
  }
  return placeIn(store, binding, read.settings);
}

// The connector of the store decides what the binding's place means
function placeIn(store: Store, binding: Binding, settings: Settings): PlaceResult {
  if (store.connector === "file") {
    return fileInStore(store, binding);
  }
  if (store.connector === "ghost") {
    return ghostField(store, binding, settings);
  }
  if (store.connector === "rest") {
    return refused([`The store "${store.name}" is a rest store. The rest connector is not built yet.`]);
  }
  return refused([`The store "${store.name}" has a connector dfm does not know: ${store.connector}`]);
}

function workingFolderFile(object: string): PlaceResult {
  const path = `${object}.txt`;
  return { ok: true, place: { connector: "file", path, label: `file ${path} (no binding: the working folder)` } };
}

// A file store keeps the object under its folder; the place may not climb out of it
function fileInStore(store: Store, binding: Binding): PlaceResult {
  const place = binding.place.trim();
  if (place.startsWith("/") || place.startsWith("~") || place.split("/").includes("..")) {
    return refused([`The place of the ${binding.object} of ${binding.business} must be a path inside the store's folder: ${place}`]);
  }
  const path = `${store.where.replace(/\/+$/, "")}/${place}`;
  return { ok: true, place: { connector: "file", path, label: `file ${path}` } };
}

// A Ghost store names a Ghost site in settings; the place is a member's email and a custom field
function ghostField(store: Store, binding: Binding, settings: Settings): PlaceResult {
  const site = settings.sites.find((each) => each.business === store.where && each.platform === "ghost");
  if (!site) {
    return refused([`The store "${store.name}" names the Ghost site ${store.where}, which settings do not have. Add it with dfm-ghost:site-add.`]);
  }
  if (!site.keyName) {
    return refused([`The Ghost site ${site.business} names no key in settings. Add it again with dfm-ghost:site-add.`]);
  }
  if (!site.address.startsWith("https://")) {
    return refused([`The address for ${site.business} is not https://: ${site.address}`]);
  }
  if (!settings.keysFile) {
    return refused(["Settings name no keys file. Add a line such as: keys file: ~/.config/dfm/.env"]);
  }

  const parts = binding.place.trim().split(/\s+/);
  const [email, field] = parts;
  if (parts.length !== 2 || !email.includes("@") || !FIELD.test(field)) {
    return refused([
      `The place of the ${binding.object} of ${binding.business} must be a member's email and a field, such as: owner@example.com next`,
    ]);
  }

  const label = `ghost ${site.business} member ${email} field ${field}`;
  return {
    ok: true,
    place: { connector: "ghost", site: { ...site, keyName: site.keyName }, keysFile: settings.keysFile, email, field, label },
  };
}

function refused(problems: string[]): PlaceResult {
  return { ok: false, problems };
}
