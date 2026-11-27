// Built by pnpm build from its src folder. Do not edit: change the source and build again.

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
var EXIT_REFUSED_OR_FAILED = 2;

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

// ../../../../packages/core/src/node/print-output.ts
function printOutput(result, mode) {
  const output = formatOutput(result, mode);
  process.stdout.write(`${output}
`);
}

// ../../../../packages/core/src/node/text-file.ts
import { readFile, writeFile } from "node:fs/promises";
async function readText(path) {
  try {
    return await readFile(expandHome(path), "utf8");
  } catch {
    return void 0;
  }
}
async function writeText(path, text) {
  await writeFile(expandHome(path), text, "utf8");
}

// src/done-lines.ts
var READ = /^(\d{4}-\d{2}-\d{2}) read on (\d{4}-\d{2}-\d{2})$/;
var SAID = /^(\d{4}-\d{2}-\d{2}) said on site on (\d{4}-\d{2}-\d{2}): "(.*)" (\S+) \[/;
var CHANGE = /^(\d{4}-\d{2}-\d{2}) ((?:new|was|gone) .+)$/;
var TOTAL = /^(\d{4}-\d{2}-\d{2}) fact total (.+): (\d+)$/;
function readDone(lines) {
  const seen = { reads: [], said: [], changes: [], totals: [] };
  for (const line of lines) {
    const read = READ.exec(line);
    const said = SAID.exec(line);
    const change = CHANGE.exec(line);
    const total = TOTAL.exec(line);
    if (read) {
      seen.reads.push({ monday: read[1], day: read[2] });
    } else if (said) {
      seen.said.push({ monday: said[1], day: said[2], title: said[3], url: said[4] });
    } else if (change) {
      seen.changes.push({ monday: change[1], text: change[2] });
    } else if (total) {
      seen.totals.push({ monday: total[1], fact: total[2], n: Number(total[3]) });
    }
  }
  return seen;
}
function isTick(line) {
  return /^\d{4}-\d{2}-\d{2} .+: done$/.test(line);
}

// src/ledger-parts.ts
var PART = /^=== (graph|plan|done|summary) ===$/;
function splitParts(text) {
  const parts = { graph: [], plan: [], done: [], summary: [] };
  let current;
  for (const line of text.split(/\r?\n/)) {
    const heading = PART.exec(line.trim());
    if (heading) {
      current = heading[1];
      continue;
    }
    if (current) {
      parts[current].push(line);
    }
  }
  return { graph: trimmed(parts.graph), plan: trimmed(parts.plan), done: trimmed(parts.done), summary: trimmed(parts.summary) };
}
function joinParts(parts) {
  const sections = ["spec 1"];
  for (const name of ["graph", "plan", "done", "summary"]) {
    sections.push(`=== ${name} ===`, ...parts[name], "");
  }
  return `${sections.join("\n").trimEnd()}
`;
}
function trimmed(lines) {
  let start = 0;
  let end = lines.length;
  while (start < end && lines[start].trim() === "") {
    start += 1;
  }
  while (end > start && lines[end - 1].trim() === "") {
    end -= 1;
  }
  return lines.slice(start, end);
}

// src/mondays.ts
var DAY_MS = 24 * 60 * 60 * 1e3;
function mondayOf(day) {
  const date = /* @__PURE__ */ new Date(`${day}T00:00:00Z`);
  const daysSinceMonday = (date.getUTCDay() + 6) % 7;
  return addDays(day, -daysSinceMonday);
}
function addDays(day, days) {
  const date = /* @__PURE__ */ new Date(`${day}T00:00:00Z`);
  return new Date(date.getTime() + days * DAY_MS).toISOString().slice(0, 10);
}

// src/first-sentence.ts
function firstSentence(text, skip) {
  const lines = text.split("\n").map((line) => line.trim()).filter((line) => line !== "");
  const words = lines.filter((line) => !skip.includes(line) && !/^\d{4}-\d{2}-\d{2}$/.test(line));
  const body = words.join(" ");
  const sentence = /^(.+?[.!?])(?:\s|$)/.exec(body);
  return sentence ? sentence[1] : body;
}

// src/post-title.ts
function postTitle(tabTitle, text) {
  const lines = text.split("\n").map((line) => line.trim());
  const cut = tabTitle.lastIndexOf(" | ");
  if (cut < 0) {
    return { title: tabTitle };
  }
  const own = tabTitle.slice(0, cut);
  if (!lines.includes(own)) {
    return { title: tabTitle };
  }
  return { title: own, siteName: tabTitle.slice(cut + 3) };
}

// src/said-line.ts
function saidFor(post) {
  const { title, siteName } = postTitle(post.title, post.text);
  const skip = siteName ? [title, siteName] : [title];
  const summary = firstSentence(post.text, skip);
  const monday = mondayOf(post.day);
  return {
    monday,
    day: post.day,
    title,
    url: post.url,
    line: `${monday} said on site on ${post.day}: "${title}" ${post.url} [everyone] summary: "${summary}"`
  };
}

// src/add-read.ts
function addRead(ledgerText, read) {
  const parts = splitParts(ledgerText);
  const known = new Set(readDone(parts.done).said.map((said) => said.url));
  const monday = mondayOf(read.day);
  const dated = read.posts.filter((post) => post.day !== void 0);
  const fresh = dated.filter((post) => !known.has(post.url)).map(saidFor).sort((a, b) => a.day.localeCompare(b.day));
  const lines = [
    `${monday} read on ${read.day}`,
    `${monday} fact total pages: ${read.counts.pages}`,
    `${monday} fact total posts: ${read.counts.posts}`,
    ...fresh.map((said) => said.line)
  ];
  const done = parts.done.length > 0 ? [...parts.done, "", ...lines] : lines;
  return { text: joinParts({ ...parts, done }), newPosts: fresh.length, undated: read.posts.length - dated.length };
}

// src/graph-lines.ts
var NO_PROOF = /^claim "(.+)": no proof on the site\b/;
var UNTIL = /^offer (.+?): .* until (\d{4}-\d{2}-\d{2})\b/;
var NAMED = /^(offer|channel) (.+?):/;
function claimsWithNoProof(graph) {
  return graph.flatMap((line) => NO_PROOF.exec(line.trim())?.[1] ?? []).map((words) => `"${words}"`);
}
function offersEnded(graph, asAt) {
  const ended = [];
  for (const line of graph) {
    const offer = UNTIL.exec(line.trim());
    if (offer && offer[2] < asAt) {
      ended.push(`${offer[1]} on ${offer[2]}`);
    }
  }
  return ended;
}
function namedLines(graph) {
  return graph.flatMap((line) => {
    const named = NAMED.exec(line.trim());
    return named ? [{ word: named[1], name: named[2] }] : [];
  });
}

// src/words.ts
function listOf(items) {
  if (items.length <= 1) {
    return items.join("");
  }
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}
var PERIOD_WORDS = {
  week: { many: "weeks", one: "the week of", ones: "the weeks of" },
  "2 weeks": { many: "fortnights", one: "the fortnight from", ones: "the fortnights from" },
  month: { many: "months", one: "the month of", ones: "the months of" }
};

// src/gaps.ts
var STEP = /^every (week|month|2 weeks|day) (.+?)(?: from \d{4}-\d{2}-\d{2})?(?: \((?:stated|observed|inferred)\))?$/;
function findGaps(ledgerText, marketText) {
  const ledger = splitParts(ledgerText);
  const market = splitParts(marketText);
  const inside = namedLines(ledger.graph);
  const outside = namedLines(market.graph);
  const has = (list, item) => list.some((each) => each.word === item.word && each.name.toLowerCase() === item.name.toLowerCase());
  return {
    notOnSite: inside.filter((item) => !has(outside, item)),
    notInLedger: outside.filter((item) => item.word === "offer" && !has(inside, item)),
    planned: ledger.plan.filter((line) => STEP.test(line.trim())),
    seen: market.summary.filter((line) => line.startsWith("every ") || line.startsWith("posts: "))
  };
}
function gapsText(gaps) {
  const named = (items) => items.length > 0 ? listOf(items.map((item) => `${item.word} ${item.name}`)) : "nothing";
  return [
    `in its ledger, not on its site: ${named(gaps.notOnSite)}`,
    `on its site, not in its ledger: ${named(gaps.notInLedger)}`,
    "its ledger plans:",
    ...gaps.planned.length > 0 ? gaps.planned.map((line) => `  ${line}`) : ["  nothing repeats"],
    "its site shows:",
    ...gaps.seen.length > 0 ? gaps.seen.map((line) => `  ${line}`) : ["  no plan worked out"],
    ""
  ].join("\n");
}

// src/new-ledger.ts
function newLedger(business, site, own) {
  const graph = [
    `business ${business}:`,
    `site ${site} (sitemap)`,
    ...own ? ["own"] : [],
    "fact pages: the site's sitemap (observed)",
    "fact posts: the site's sitemap (observed)"
  ];
  return ["spec 1", "=== graph ===", ...graph, "", "=== plan ===", "", "=== done ===", "", "=== summary ===", ""].join("\n");
}

// src/read-args.ts
var USAGE = "node dist/run.js --read <folder> --day <YYYY-MM-DD> --out <file> (--ledger <file> | --business <name> --site <address> [--own]) [--dates <file>] | --summary <ledger> [--dates <file>] | --gaps --ledger <ledger> --market <market ledger> [--json]";
var DAY = /^\d{4}-\d{2}-\d{2}$/;
function readArgs(args) {
  const rest = args.filter((arg) => arg !== "--json");
  if (rest.includes("--gaps")) {
    return gapsArgs(rest);
  }
  if (rest.includes("--summary")) {
    return summaryArgs(rest);
  }
  if (rest.includes("--read")) {
    return readJobArgs(rest);
  }
  return refused("Name a job: --read, --summary or --gaps.");
}
function readJobArgs(args) {
  const folder = valueOf(args, "--read");
  const day = valueOf(args, "--day");
  const out = valueOf(args, "--out");
  const ledger = valueOf(args, "--ledger");
  const business = valueOf(args, "--business");
  const site = valueOf(args, "--site");
  if (!folder || !out || !day || !DAY.test(day)) {
    return refused("Name the read's folder, its day (YYYY-MM-DD) and a new file for the ledger.");
  }
  if (!ledger && !(business && site)) {
    return refused("Name the ledger to add the read to. For a first read, name the business and its site.");
  }
  return { ok: true, args: { job: "read", folder, day, out, ledger, business, site, own: args.includes("--own"), dates: valueOf(args, "--dates") } };
}
function summaryArgs(args) {
  const ledger = valueOf(args, "--summary");
  return ledger ? { ok: true, args: { job: "summary", ledger, dates: valueOf(args, "--dates") } } : refused("Name the ledger to write the summary of.");
}
function gapsArgs(args) {
  const ledger = valueOf(args, "--ledger");
  const market = valueOf(args, "--market");
  return ledger && market ? { ok: true, args: { job: "gaps", ledger, market } } : refused("Name the business's ledger and its own market ledger.");
}
function refused(problem) {
  return { ok: false, problem: `${problem} Use: ${USAGE}` };
}
function valueOf(args, flag) {
  const at = args.indexOf(flag);
  const value = at >= 0 ? args[at + 1] : void 0;
  return value && !value.startsWith("--") ? value : void 0;
}

// src/read-counts.ts
var COUNTS = /pages: (\d+), posts: (\d+)/;
function readCounts(countedText) {
  const found = COUNTS.exec(countedText);
  if (!found) {
    return void 0;
  }
  return { pages: Number(found[1]), posts: Number(found[2]) };
}

// src/read-posts.ts
var PUBLISHED = /^Published: (\d{4}-\d{2}-\d{2})$/;
function readPosts(pagesText) {
  const lines = pagesText.split(/\r?\n/);
  const posts = [];
  let inPosts = false;
  let current;
  lines.forEach((line, index) => {
    if (line.trim() === "## Posts" || line.trim() === "## Pages") {
      inPosts = line.trim() === "## Posts";
      current = void 0;
      return;
    }
    const startsItem = line.startsWith("### ") && (lines[index + 1] ?? "").startsWith("URL: ");
    if (startsItem) {
      current = inPosts ? { title: line.slice(4).trim(), url: lines[index + 1].slice(5).trim(), text: "" } : void 0;
      if (current) {
        posts.push(current);
      }
      return;
    }
    if (current === void 0 || line.startsWith("URL: ")) {
      return;
    }
    const published = PUBLISHED.exec(line);
    if (published) {
      current.day = published[1];
      return;
    }
    current.text += `${line}
`;
  });
  return posts;
}

// src/plan-steps.ts
var STEP2 = /^every (week|month|2 weeks) (.+) from (\d{4}-\d{2}-\d{2})(?: \((?:stated|observed|inferred)\))?$/;
var CLOSURE = /^on (\d{4}-\d{2}-\d{2})(?: to (\d{4}-\d{2}-\d{2}))?:/;
function readPlan(lines) {
  const steps = [];
  const closures = [];
  for (const line of lines) {
    const step = STEP2.exec(line.trim());
    const closure = CLOSURE.exec(line.trim());
    if (step) {
      steps.push({ every: step[1], name: step[2], from: step[3] });
    } else if (closure) {
      closures.push({ from: closure[1], to: closure[2] ?? closure[1] });
    }
  }
  return { steps, closures };
}
function postIsFor(step, title) {
  return step.name === "a post" || title.toLowerCase().includes(step.name.toLowerCase());
}

// src/periods.ts
function periodsFrom(every, from, through) {
  const periods = [];
  let start = firstStart(every, from);
  while (start <= through) {
    const end = nextStart(every, start);
    periods.push({ start, end });
    start = end;
  }
  return periods;
}
function firstStart(every, from) {
  return every === "month" ? `${from.slice(0, 7)}-01` : mondayOf(from);
}
function nextStart(every, start) {
  if (every === "week") {
    return addDays(start, 7);
  }
  if (every === "2 weeks") {
    return addDays(start, 14);
  }
  const year = Number(start.slice(0, 4));
  const month = Number(start.slice(5, 7));
  return month === 12 ? `${year + 1}-01-01` : `${year}-${String(month + 1).padStart(2, "0")}-01`;
}

// src/step-count.ts
function countStep(step, posts, closures, lastRead) {
  const days = posts.filter((post) => postIsFor(step, post.title)).map((post) => post.day);
  const count = { done: 0, of: 0, notDone: [], closed: [] };
  for (const period of periodsFrom(step.every, step.from, lastRead)) {
    const done = days.some((day) => inPeriod(day, period));
    const current = inPeriod(lastRead, period);
    if (insideAClosure(period.start, closures)) {
      count.closed.push(period.start);
    } else if (done) {
      count.done += 1;
      count.of += 1;
    } else if (!current) {
      count.of += 1;
      count.notDone.push(period.start);
    }
  }
  return count;
}
function strengthOf(count) {
  if (count.of >= 6 && count.done === count.of) {
    return "believed";
  }
  return count.done >= 3 ? "assumed" : "unknown";
}
function inPeriod(day, period) {
  return day >= period.start && day < period.end;
}
function insideAClosure(day, closures) {
  return closures.some((closure) => day >= closure.from && day <= closure.to);
}

// src/summary.ts
function summaryLines(graph, plan, done) {
  const reads = done.reads;
  if (reads.length === 0) {
    return ["not read yet (calculated)"];
  }
  const first = reads[0];
  const last = reads[reads.length - 1];
  const lines = [`as at ${last.monday}, read ${reads.length} ${reads.length === 1 ? "time" : "times"} from ${first.monday}`];
  lines.push(postsLine(done, last.monday));
  lines.push(...planLines(plan, done, last.day));
  lines.push(`changed at the last read: ${changesAt(done, (monday) => monday === last.monday)}`);
  if (reads.length > 2) {
    lines.push(`changed at earlier reads: ${changesAt(done, (monday) => monday !== first.monday && monday !== last.monday)}`);
  }
  const ended = offersEnded(graph, last.monday);
  if (ended.length > 0) {
    lines.push(`offers ended: ${listOf(ended)}`);
  }
  const noProof = claimsWithNoProof(graph);
  lines.push(`claims with no proof: ${noProof.length > 0 ? noProof.join(", ") : "none"}`);
  return lines.map((line) => `${line} (calculated)`);
}
function postsLine(done, lastMonday) {
  const total = done.totals.filter((each) => each.fact === "posts" && each.monday === lastMonday).at(-1)?.n;
  const days = done.said.map((said) => said.day).sort();
  if ((total ?? days.length) === 0) {
    return "posts: none on the site";
  }
  const range = days.length > 0 ? `, published from ${days[0]} to ${days[days.length - 1]}` : "";
  return `posts: ${total ?? days.length}${range}`;
}
function planLines(plan, done, lastReadDay) {
  if (plan.steps.length === 0) {
    return [done.said.length === 0 ? "plan: none worked out, no posts to work from" : "plan: none worked out"];
  }
  return plan.steps.map((step) => {
    const count = countStep(step, done.said, plan.closures, lastReadDay);
    const words = PERIOD_WORDS[step.every];
    const parts = [`every ${step.every} ${step.name}: done ${count.done} of ${count.of} ${words.many}`];
    if (count.notDone.length > 0) {
      parts.push(`not in ${count.notDone.length === 1 ? words.one : words.ones} ${listOf(count.notDone)}`);
    }
    if (count.closed.length > 0) {
      parts.push(`${count.closed.length === 1 ? words.one : words.ones} ${listOf(count.closed)} inside a closure`);
    }
    parts.push(strengthOf(count));
    return parts.join(", ");
  });
}
function changesAt(done, at) {
  const changes = done.changes.filter((change) => at(change.monday)).map((change) => `${change.monday} ${change.text}`);
  return changes.length > 0 ? changes.join("; ") : "nothing";
}

// src/ticks.ts
function ticksFor(said, steps) {
  return steps.filter((step) => postIsFor(step, said.title)).map((step) => `${said.monday} ${step.name}: done`);
}

// src/refresh.ts
var SAID2 = / said on site on /;
function refresh(ledgerText) {
  const parts = splitParts(ledgerText);
  const plan = readPlan(parts.plan);
  const kept = parts.done.filter((line) => !isTick(line));
  const seen = readDone(kept);
  const done = [];
  for (const line of kept) {
    done.push(line);
    if (SAID2.test(line)) {
      const said = seen.said.find((each) => line.startsWith(`${each.monday} said on site on ${each.day}: "${each.title}" ${each.url} `));
      if (said) {
        done.push(...ticksFor(said, plan.steps));
      }
    }
  }
  return joinParts({ ...parts, done, summary: summaryLines(parts.graph, plan, readDone(done)) });
}

// src/worked-out-dates.ts
var A_MONDAY = / is the Monday of the week of /;
function workedOutDates(ledgerText, before) {
  const done = readDone(splitParts(ledgerText).done);
  const mondays = [...done.reads, ...done.said].map((each) => `${each.monday} is the Monday of the week of ${each.day}`);
  const fromWords = before.split(/\r?\n/).filter((line) => line.trim() !== "" && !A_MONDAY.test(line));
  return `${[...new Set([...mondays].sort()), ...fromWords].join("\n")}
`;
}

// src/run.ts
async function main(args) {
  const asked = readArgs(args);
  if (!asked.ok) {
    return failed(asked.problem);
  }
  const job = asked.args;
  if (job.job === "read") {
    return await addAReadJob(job, args);
  }
  if (job.job === "summary") {
    return await summaryJob(job, args);
  }
  return await gapsJob(job, args);
}
async function addAReadJob(job, args) {
  if (await readText(job.out) !== void 0) {
    return failed(`${job.out} is already there: name a new file. A read never writes over one.`);
  }
  const ledger = job.ledger ? await readText(job.ledger) : newLedger(job.business ?? "", job.site ?? "", job.own);
  if (ledger === void 0) {
    return failed(`Cannot read ${job.ledger}`);
  }
  const pages = await readText(`${job.folder}/pages.txt`) ?? await readText(`${job.folder}/llms-full.txt`);
  const counted = await readText(`${job.folder}/counted.txt`);
  const counts = counted === void 0 ? void 0 : readCounts(counted);
  if (pages === void 0 || counts === void 0) {
    return failed(`Cannot read the pages and counts in ${job.folder}: run profile-make there first.`);
  }
  const added = addRead(ledger, { day: job.day, counts, posts: readPosts(pages) });
  const written = refresh(added.text);
  await writeText(job.out, written);
  await writeDates(job.dates, written);
  const note = added.undated > 0 ? `, ${added.undated} with no published day (counted, not said)` : "";
  printOutput({ text: `wrote ${job.out}: read on ${job.day}, ${added.newPosts} new posts${note}`, data: { out: job.out, newPosts: added.newPosts, undated: added.undated } }, outputMode(args));
  return EXIT_DONE;
}
async function summaryJob(job, args) {
  const ledger = await readText(job.ledger);
  if (ledger === void 0) {
    return failed(`Cannot read ${job.ledger}`);
  }
  const written = refresh(ledger);
  await writeText(job.ledger, written);
  await writeDates(job.dates, written);
  printOutput({ text: `wrote the ticks and summary of ${job.ledger}`, data: { ledger: job.ledger } }, outputMode(args));
  return EXIT_DONE;
}
async function gapsJob(job, args) {
  const ledger = await readText(job.ledger);
  const market = await readText(job.market);
  if (ledger === void 0 || market === void 0) {
    return failed(`Cannot read ${ledger === void 0 ? job.ledger : job.market}`);
  }
  const gaps = findGaps(ledger, market);
  printOutput({ text: gapsText(gaps), data: gaps }, outputMode(args));
  return EXIT_DONE;
}
async function writeDates(file, ledger) {
  if (file) {
    await writeText(file, workedOutDates(ledger, await readText(file) ?? ""));
  }
}
function failed(problem) {
  process.stderr.write(`${problem}
`);
  return EXIT_REFUSED_OR_FAILED;
}
process.exitCode = await main(process.argv.slice(2));
