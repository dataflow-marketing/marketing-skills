// Built by pnpm build from its src folder. Do not edit: change the source and build again.

// ../../../../packages/core/src/settings/read-line.ts
var SITE_LINE = /^site ([a-z0-9-]+): (\S+) (\S+)(?: account (\S+))?(?: key in (\S+))?$/;
var STORE_LINE = /^store ([a-z0-9-]+): (\S+) (.+?)(?: key in (\S+))?$/;
var BINDING_LINE = /^binding (\S+) ([a-z0-9-]+): (\S+) (.+)$/;
var HOUSE_RULE_LINE = /^house rule (.+?): (.+)$/;
function readSiteLine(line) {
  const match = SITE_LINE.exec(line);
  if (!match) {
    return void 0;
  }
  const site = {
    business: match[1],
    platform: match[2],
    address: match[3]
  };
  if (match[4]) {
    site.account = match[4];
  }
  if (match[5]) {
    site.keyName = match[5];
  }
  return site;
}
function readStoreLine(line) {
  const match = STORE_LINE.exec(line);
  if (!match) {
    return void 0;
  }
  const store = {
    name: match[1],
    connector: match[2],
    where: match[3]
  };
  if (match[4]) {
    store.keyName = match[4];
  }
  return store;
}
function readBindingLine(line) {
  const match = BINDING_LINE.exec(line);
  if (!match) {
    return void 0;
  }
  return {
    object: match[1],
    business: match[2],
    store: match[3],
    place: match[4]
  };
}
function readHouseRuleLine(line) {
  const match = HOUSE_RULE_LINE.exec(line);
  if (!match) {
    return void 0;
  }
  return {
    name: match[1],
    rule: match[2]
  };
}
function readValueAfter(prefix, line) {
  if (!line.startsWith(prefix)) {
    return void 0;
  }
  const value = line.slice(prefix.length).trim();
  if (value === "") {
    return void 0;
  }
  return value;
}

// ../../../../packages/core/src/settings/add-line.ts
var LINE_KINDS = [
  { name: "time zone", addTo: addTimeZone },
  { name: "week starts", addTo: addWeekStarts },
  { name: "keys file", addTo: addKeysFile },
  { name: "backups", addTo: addBackups },
  { name: "site", addTo: addSite },
  { name: "store", addTo: addStore },
  { name: "binding", addTo: addBinding },
  { name: "house rule", addTo: addHouseRule },
  { name: "own email", addTo: addOwnEmail }
];
function addLine(settings, line) {
  for (const kind of LINE_KINDS) {
    if (kind.addTo(settings, line)) {
      return kind.name;
    }
  }
  return void 0;
}
function addTimeZone(settings, line) {
  const timeZone = readValueAfter("time zone:", line);
  if (timeZone === void 0) {
    return false;
  }
  settings.timeZone = timeZone;
  return true;
}
function addWeekStarts(settings, line) {
  const weekStarts = readValueAfter("week starts:", line);
  if (weekStarts === void 0) {
    return false;
  }
  settings.weekStarts = weekStarts;
  return true;
}
function addKeysFile(settings, line) {
  const keysFile = readValueAfter("keys file:", line);
  if (keysFile === void 0) {
    return false;
  }
  settings.keysFile = keysFile;
  return true;
}
function addBackups(settings, line) {
  const backups = readValueAfter("backups:", line);
  if (backups === void 0) {
    return false;
  }
  settings.backups = backups;
  return true;
}
function addSite(settings, line) {
  const site = readSiteLine(line);
  if (site === void 0) {
    return false;
  }
  settings.sites.push(site);
  return true;
}
function addStore(settings, line) {
  const store = readStoreLine(line);
  if (store === void 0) {
    return false;
  }
  settings.stores.push(store);
  return true;
}
function addBinding(settings, line) {
  const binding = readBindingLine(line);
  if (binding === void 0) {
    return false;
  }
  settings.bindings.push(binding);
  return true;
}
function addHouseRule(settings, line) {
  const houseRule = readHouseRuleLine(line);
  if (houseRule === void 0) {
    return false;
  }
  settings.houseRules.push(houseRule);
  return true;
}
function addOwnEmail(settings, line) {
  const email = readValueAfter("own email:", line);
  if (email === void 0 || !/^\S+@\S+$/.test(email)) {
    return false;
  }
  settings.ownEmails.push(email.toLowerCase());
  return true;
}

// ../../../../packages/core/src/settings/check-settings.ts
var DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
function checkSettings(settings) {
  return [
    ...checkTimeZone(settings),
    ...checkWeekStarts(settings),
    ...checkBindings(settings)
  ];
}
function checkTimeZone(settings) {
  if (!settings.timeZone) {
    return ["time zone: missing (it is required)"];
  }
  if (!isKnownTimeZone(settings.timeZone)) {
    return ["time zone: not a known time zone (for example Australia/Melbourne)"];
  }
  return [];
}
function isKnownTimeZone(timeZone) {
  try {
    new Intl.DateTimeFormat("en", { timeZone });
    return true;
  } catch {
    return false;
  }
}
function checkWeekStarts(settings) {
  if (DAYS.includes(settings.weekStarts)) {
    return [];
  }
  return ["week starts: not a day of the week (for example Monday)"];
}
function checkBindings(settings) {
  const listed = new Set(settings.stores.map((store) => store.name));
  const problems = [];
  for (const binding of settings.bindings) {
    if (!listed.has(binding.store)) {
      problems.push(`binding ${binding.object} ${binding.business}: the store "${binding.store}" is not listed`);
    }
  }
  return problems;
}

// ../../../../packages/core/src/settings/parse-settings.ts
var SPEC_LINE = "spec 1";
var DEFAULT_WEEK_START = "Monday";
var ONCE_ONLY = ["time zone", "week starts", "keys file", "backups"];
function parseSettings(text) {
  const lines = numberedLines(text);
  const settings = emptySettings();
  const specProblems = checkSpecLine(lines);
  const lineProblems = addEachLine(settings, lines);
  const repeatProblems = findRepeatedLines(lines);
  const settingsProblems = checkSettings(settings);
  return {
    settings,
    problems: [...specProblems, ...lineProblems, ...repeatProblems, ...settingsProblems]
  };
}
function numberedLines(text) {
  const lines = text.split(/\r?\n/).map((line, index) => ({ number: index + 1, text: line.trim() }));
  return lines.filter((line) => line.text !== "");
}
function emptySettings() {
  return {
    spec: SPEC_LINE,
    weekStarts: DEFAULT_WEEK_START,
    sites: [],
    stores: [],
    bindings: [],
    houseRules: [],
    ownEmails: []
  };
}
function checkSpecLine(lines) {
  const first = lines[0];
  if (first?.number === 1 && first.text === SPEC_LINE) {
    return [];
  }
  return [`line 1: expected "${SPEC_LINE}"`];
}
function addEachLine(settings, lines) {
  const problems = [];
  for (const line of linesAfterSpec(lines)) {
    const kind = addLine(settings, line.text);
    if (kind === void 0) {
      problems.push(notUnderstood(line));
    }
  }
  return problems;
}
function findRepeatedLines(lines) {
  const problems = [];
  const given = /* @__PURE__ */ new Set();
  for (const line of linesAfterSpec(lines)) {
    const kind = kindOf(line.text);
    if (kind === void 0 || !ONCE_ONLY.includes(kind)) {
      continue;
    }
    if (given.has(kind)) {
      problems.push(`line ${line.number}: ${kind} is given more than once`);
    }
    given.add(kind);
  }
  return problems;
}
function linesAfterSpec(lines) {
  return lines.filter((line) => line.number > 1);
}
function kindOf(text) {
  return addLine(emptySettings(), text);
}
function notUnderstood(line) {
  const kind = LINE_KINDS.find((each) => line.text.startsWith(each.name));
  if (kind) {
    return `line ${line.number}: a ${kind.name} line that is not understood`;
  }
  return `line ${line.number}: not understood`;
}

// ../../../../packages/core/src/run-log/format-run-line.ts
var SEPARATOR = " | ";
var NOTHING = "(none)";
function formatRunLine(entry) {
  const parts = [
    entry.when.toISOString(),
    oneLine(entry.skill),
    oneLine(entry.what),
    oneLine(entry.where),
    `before: ${oneLine(entry.before)}`,
    `after: ${oneLine(entry.after)}`
  ];
  return parts.join(SEPARATOR);
}
function oneLine(value) {
  const flat = value.replace(/\s+/g, " ").trim();
  if (flat === "") {
    return NOTHING;
  }
  return flat;
}

// ../../../../packages/core/src/output/output-mode.ts
function outputMode(args) {
  if (args.includes("--json")) {
    return "json";
  }
  return "text";
}

// ../../../../packages/core/src/output/format-output.ts
function formatOutput(result, mode) {
  if (mode === "json") {
    return JSON.stringify(result.data, null, 2);
  }
  return result.text;
}

// ../../../../packages/core/src/output/exit-codes.ts
var EXIT_DONE = 0;
var EXIT_PROBLEMS_FOUND = 1;
var EXIT_REFUSED_OR_FAILED = 2;

// ../../../../packages/core/src/output/write-mode.ts
var MODE_FLAGS = {
  "--preview": "preview",
  "--go": "go",
  "--read-back": "read-back"
};
function writeMode(args) {
  const named = [];
  for (const arg of args) {
    const mode = MODE_FLAGS[arg];
    if (mode) {
      named.push(mode);
    }
  }
  if (named.length > 1) {
    return { ok: false, problem: "Name one mode only: --preview, --go or --read-back." };
  }
  if (named.length === 1) {
    return { ok: true, mode: named[0] };
  }
  return { ok: true, mode: "preview" };
}
function isModeFlag(arg) {
  return arg in MODE_FLAGS;
}

// ../../../../packages/core/src/node/expand-home.ts
import { homedir } from "node:os";
import { join } from "node:path";
function expandHome(path) {
  if (path === "~") {
    return homedir();
  }
  if (path.startsWith("~/")) {
    return join(homedir(), path.slice(2));
  }
  return path;
}

// ../../../../packages/core/src/node/append-run-line.ts
import { appendFile } from "node:fs/promises";
async function appendRunLine(runLogPath2, entry) {
  const line = formatRunLine(entry);
  await appendFile(expandHome(runLogPath2), `${line}
`, "utf8");
}

// ../../../../packages/core/src/node/print-output.ts
function printOutput(result, mode) {
  const output = formatOutput(result, mode);
  process.stdout.write(`${output}
`);
}

// ../../../../packages/core/src/node/run-log-path.ts
import { dirname, join as join2 } from "node:path";
var RUN_LOG_FILE = "run-log.txt";
function runLogPath(settingsPath, given) {
  if (given) {
    return expandHome(given);
  }
  return join2(dirname(expandHome(settingsPath)), RUN_LOG_FILE);
}

// ../../../../packages/store/src/find-place.ts
var NAME = /^[a-z0-9-]+$/;
var FIELD = /^[A-Za-z0-9_-]+$/;
var LOCAL_ADDRESS = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;
function findPlace(read, object, business) {
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
function placeIn(store, binding, settings) {
  if (store.connector === "file") {
    return fileInStore(store, binding);
  }
  if (store.connector === "ghost") {
    return ghostField(store, binding, settings);
  }
  if (store.connector === "rest") {
    return restObject(store, binding, settings);
  }
  return refused([`The store "${store.name}" has a connector dfm does not know: ${store.connector}`]);
}
function workingFolderFile(object) {
  const path = `${object}.txt`;
  return { ok: true, place: { connector: "file", path, label: `file ${path} (no binding: the working folder)` } };
}
function fileInStore(store, binding) {
  const place = binding.place.trim();
  if (place.startsWith("/") || place.startsWith("~") || place.split("/").includes("..")) {
    return refused([`The place of the ${binding.object} of ${binding.business} must be a path inside the store's folder: ${place}`]);
  }
  const path = `${store.where.replace(/\/+$/, "")}/${place}`;
  return { ok: true, place: { connector: "file", path, label: `file ${path}` } };
}
function ghostField(store, binding, settings) {
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
      `The place of the ${binding.object} of ${binding.business} must be a member's email and a field, such as: owner@example.com next`
    ]);
  }
  const label = `ghost ${site.business} member ${email} field ${field}`;
  return {
    ok: true,
    place: { connector: "ghost", site: { ...site, keyName: site.keyName }, keysFile: settings.keysFile, email, field, label }
  };
}
function restObject(store, binding, settings) {
  const address = restAddress(store.where);
  const addressProblem = restAddressProblem(store.name, address);
  if (addressProblem) {
    return refused([addressProblem]);
  }
  if (!store.keyName) {
    return refused([`The store "${store.name}" names no key. Its line ends with the key's variable, such as: key in COFFEE_SHOP_STORE_KEY`]);
  }
  if (!settings.keysFile) {
    return refused(["Settings name no keys file. Add a line such as: keys file: ~/.config/dfm/.env"]);
  }
  const id = binding.place.trim();
  if (!NAME.test(id)) {
    return refused([`The place of the ${binding.object} of ${binding.business} in a rest store is the object's id, lowercase with hyphens, such as: ${binding.business}`]);
  }
  const label = `rest ${address} ${binding.object} ${id}`;
  return {
    ok: true,
    place: { connector: "rest", address, keyName: store.keyName, keysFile: settings.keysFile, kind: binding.object, id, label }
  };
}
function restAddress(where) {
  return where.trim().replace(/\/+$/, "");
}
function restAddressProblem(storeName, address) {
  if (address.startsWith("https://") || LOCAL_ADDRESS.test(address)) {
    return void 0;
  }
  return `The address of the store "${storeName}" is not https:// (or http://localhost for a Worker on this computer): ${address}`;
}
function refused(problems) {
  return { ok: false, problems };
}

// ../../../../packages/store/src/args/read-flags.ts
function readFlags(args, rules) {
  const values = {};
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    const value = args[index + 1];
    if (arg === "--json" || isModeFlag(arg)) {
      continue;
    }
    if (rules.valueFlags.includes(arg) && value !== void 0 && !value.startsWith("--")) {
      values[arg] = value;
      index += 1;
      continue;
    }
    return { ok: false, problem: `Not understood: ${arg}. Use: ${rules.usage}` };
  }
  const missing = rules.required.filter((flag) => !values[flag]);
  if (missing.length > 0) {
    return { ok: false, problem: `Missing ${missing.join(", ")}. Use: ${rules.usage}` };
  }
  return { ok: true, values };
}

// src/check-read-back.ts
function checkReadBack(settingsText, lines) {
  if (settingsText === void 0) {
    return ["The settings file is not there."];
  }
  const found = settingsText.split("\n").map((line) => line.trim());
  const missing = lines.filter((line) => !found.includes(line)).map((line) => `The settings file does not have the line: ${line}`);
  const problems = parseSettings(settingsText).problems.map((problem) => `settings ${problem}`);
  return [...missing, ...problems];
}

// src/describe-result.ts
function describePlan(plan, settingsPath) {
  if (plan.kind === "refused") {
    return { text: `Refused: ${plan.problem}`, data: plan };
  }
  if (plan.kind === "already there") {
    return { text: `Already in ${settingsPath}:
${plan.lines.join("\n")}`, data: plan };
  }
  const text = `Would add to ${settingsPath}:
${plan.lines.join("\n")}

Nothing is written yet. To write it, run the same command with --go.`;
  return { text, data: plan };
}
function describeAdded(lines, settingsPath, problems) {
  const head = problems.length === 0 ? `Added to ${settingsPath} and read back:` : `Added to ${settingsPath}. The read back found:`;
  const text = [head, ...problems.length === 0 ? lines : problems, "", "Next: dfm-store:store-check proves each binding can be read."].join("\n");
  return { text, data: { lines, settings: settingsPath, problems } };
}
function describeReadBack(lines, settingsPath, problems) {
  const text = problems.length === 0 ? `${settingsPath} has:
${lines.join("\n")}` : problems.join("\n");
  return { text, data: { lines, settings: settingsPath, problems } };
}

// src/node/settings-file.ts
import { appendFile as appendFile2, readFile } from "node:fs/promises";
async function readSettingsText(settingsPath) {
  try {
    return await readFile(expandHome(settingsPath), "utf8");
  } catch {
    return void 0;
  }
}
async function appendSettingsText(settingsPath, text) {
  await appendFile2(expandHome(settingsPath), text, "utf8");
}

// src/plan-add.ts
var NAME2 = /^[a-z0-9-]+$/;
var CONNECTORS = ["file", "ghost", "rest"];
var KEY_NAME = /^[A-Z][A-Z0-9_]*$/;
function planAdd(settingsText, request) {
  if (settingsText === void 0) {
    return refused2("There is no settings file yet. Start one by adding a site: dfm-ghost:site-add or dfm-site:site-add.");
  }
  if (!settingsText.startsWith("spec 1")) {
    return refused2('The settings file does not start with "spec 1". It may not be a settings file.');
  }
  const { settings, problems } = parseSettings(settingsText);
  if (problems.length > 0) {
    return refused2(`Fix the settings file first: ${problems.join("; ")}`);
  }
  if (!NAME2.test(request.store)) {
    return refused2(`A store's name is lowercase with hyphens: ${request.store}`);
  }
  if (request.connector === void 0 && request.binding === void 0) {
    return refused2("Name a store to add (--connector and --where), a binding (--object, --business and --place) or both.");
  }
  const storeLine2 = storeLineFor(settings, request);
  if (!storeLine2.ok) {
    return refused2(storeLine2.problem);
  }
  const bindingLine = bindingLineFor(settings, request);
  if (!bindingLine.ok) {
    return refused2(bindingLine.problem);
  }
  const wanted = [storeLine2.line, bindingLine.line].filter((line) => line !== void 0);
  const lines = wanted.filter((line) => !hasLine(settingsText, line));
  if (lines.length === 0) {
    return { kind: "already there", lines: wanted };
  }
  return checkedPlan(settingsText, lines, request);
}
function storeLineFor(settings, request) {
  const listed = settings.stores.find((store) => store.name === request.store);
  if (request.connector === void 0) {
    return listed ? { ok: true } : { ok: false, problem: `There is no store called ${request.store}. Add it with --connector and --where.` };
  }
  if (!request.where) {
    return { ok: false, problem: "A store needs --where: a folder for a file store, a Ghost site's name for a Ghost store, an address for a rest store." };
  }
  if (!CONNECTORS.includes(request.connector)) {
    return { ok: false, problem: `dfm does not know the connector ${request.connector}. Use file, ghost or rest.` };
  }
  const problem = connectorProblem(settings, request);
  if (problem) {
    return { ok: false, problem };
  }
  const line = storeLine(request);
  if (listed && storeLine({ store: listed.name, connector: listed.connector, where: listed.where, keyName: listed.keyName }) !== line) {
    return { ok: false, problem: `Settings already have a different store called ${request.store}. Change it by hand if it is wrong.` };
  }
  return { ok: true, line };
}
function connectorProblem(settings, request) {
  const where = request.where ?? "";
  if (request.connector === "ghost" && !settings.sites.some((site) => site.business === where && site.platform === "ghost")) {
    return `Settings have no Ghost site called ${where}. Add it with dfm-ghost:site-add first.`;
  }
  if (request.connector !== "rest" && request.keyName !== void 0) {
    return "--key-name is for a rest store only: a Ghost store uses its site's key.";
  }
  if (request.connector !== "rest") {
    return void 0;
  }
  if (request.keyName === void 0 || !KEY_NAME.test(request.keyName)) {
    return "A rest store needs --key-name: the variable in the keys file that holds its key, in capitals, such as COFFEE_SHOP_STORE_KEY.";
  }
  if (!settings.keysFile) {
    return "Settings name no keys file. Add a line such as: keys file: ~/.config/dfm/.env";
  }
  return restAddressProblem(request.store, restAddress(where));
}
function storeLine(request) {
  const line = `store ${request.store}: ${request.connector} ${request.connector === "rest" ? restAddress(request.where ?? "") : request.where}`;
  return request.keyName ? `${line} key in ${request.keyName}` : line;
}
function bindingLineFor(settings, request) {
  const binding = request.binding;
  if (binding === void 0) {
    return { ok: true };
  }
  const line = `binding ${binding.object} ${binding.business}: ${request.store} ${binding.place.trim()}`;
  const there = settings.bindings.find((each) => each.object === binding.object && each.business === binding.business);
  if (there && `binding ${there.object} ${there.business}: ${there.store} ${there.place}` !== line) {
    return {
      ok: false,
      problem: `The ${binding.object} of ${binding.business} is already bound: moving it is not adding it. Change the line by hand after moving the object.`
    };
  }
  return { ok: true, line };
}
function checkedPlan(settingsText, lines, request) {
  const append = appendAfter(settingsText, lines);
  const after = parseSettings(settingsText + append);
  if (after.problems.length > 0) {
    return refused2(`The settings would not read: ${after.problems.join("; ")}`);
  }
  if (request.binding) {
    const place = findPlace(after, request.binding.object, request.binding.business);
    if (!place.ok) {
      return refused2(place.problems.join(" "));
    }
  }
  return { kind: "add", lines, append };
}
function hasLine(settingsText, line) {
  return settingsText.split("\n").some((each) => each.trim() === line);
}
function appendAfter(settingsText, lines) {
  const added = lines.map((each) => `${each}
`).join("");
  return settingsText.endsWith("\n") ? added : `
${added}`;
}
function refused2(problem) {
  return { kind: "refused", problem };
}

// src/read-request.ts
function readRequest(values) {
  const request = { store: values["--store"] };
  if (values["--connector"] !== void 0) {
    request.connector = values["--connector"];
    request.where = values["--where"];
    if (values["--key-name"] !== void 0) {
      request.keyName = values["--key-name"];
    }
  } else if (values["--where"] !== void 0 || values["--key-name"] !== void 0) {
    return { ok: false, problem: "--where and --key-name go with --connector." };
  }
  const bindingFlags = [values["--object"], values["--business"], values["--place"]];
  const given = bindingFlags.filter((value) => value !== void 0).length;
  if (given === 3) {
    request.binding = { object: values["--object"], business: values["--business"], place: values["--place"] };
  } else if (given > 0) {
    return { ok: false, problem: "A binding needs --object, --business and --place." };
  }
  return { ok: true, request };
}

// src/run.ts
var SKILL = "dfm-store:store-add";
var USAGE = 'node dist/run.js --store <name> --settings <file> [--connector file|ghost|rest --where <folder, site or address> [--key-name <NAME>]] [--object <kind> --business <name> --place "<place>"] [--preview | --go | --read-back] [--run-log <file>] [--json]';
var FLAGS = {
  valueFlags: ["--store", "--settings", "--connector", "--where", "--key-name", "--object", "--business", "--place", "--run-log"],
  required: ["--store", "--settings"],
  usage: USAGE
};
async function main(args) {
  const output = outputMode(args);
  const mode = writeMode(args);
  if (!mode.ok) {
    return failed(mode.problem);
  }
  const flags = readFlags(args, FLAGS);
  if (!flags.ok) {
    return failed(flags.problem);
  }
  const asked = readRequest(flags.values);
  if (!asked.ok) {
    return failed(asked.problem);
  }
  const settingsPath = flags.values["--settings"];
  const before = await readSettingsText(settingsPath);
  const plan = planAdd(before, asked.request);
  if (mode.mode === "read-back") {
    return readBack(plan, settingsPath, output);
  }
  if (plan.kind === "refused") {
    printOutput(describePlan(plan, settingsPath), output);
    return EXIT_REFUSED_OR_FAILED;
  }
  if (plan.kind === "already there" || mode.mode === "preview") {
    printOutput(describePlan(plan, settingsPath), output);
    return EXIT_DONE;
  }
  await appendSettingsText(settingsPath, plan.append);
  await appendRunLine(runLogPath(settingsPath, flags.values["--run-log"]), {
    when: /* @__PURE__ */ new Date(),
    skill: SKILL,
    what: "store lines added",
    where: `settings ${settingsPath}`,
    before: "",
    after: plan.lines.join(" | ")
  });
  const problems = checkReadBack(await readSettingsText(settingsPath), plan.lines);
  printOutput(describeAdded(plan.lines, settingsPath, problems), output);
  return problems.length === 0 ? EXIT_DONE : EXIT_REFUSED_OR_FAILED;
}
async function readBack(plan, settingsPath, output) {
  const lines = plan.kind === "already there" ? plan.lines : plan.kind === "add" ? plan.lines : [];
  const problems = plan.kind === "refused" ? [plan.problem] : checkReadBack(await readSettingsText(settingsPath), lines);
  printOutput(describeReadBack(lines, settingsPath, problems), output);
  return problems.length === 0 ? EXIT_DONE : EXIT_PROBLEMS_FOUND;
}
function failed(problem) {
  process.stderr.write(`${problem}
`);
  return EXIT_REFUSED_OR_FAILED;
}
async function runSafely(args) {
  try {
    return await main(args);
  } catch (error) {
    const message = error instanceof Error ? error.message : "an unknown error";
    return failed(`Failed: ${message}`);
  }
}
process.exitCode = await runSafely(process.argv.slice(2));
