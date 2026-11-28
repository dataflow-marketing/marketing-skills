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
var EXIT_PROBLEMS_FOUND = 1;
var EXIT_REFUSED_OR_FAILED = 2;

// ../../../../packages/core/src/address/local-address.ts
function isLocalAddress(url) {
  return url.protocol === "http:" && (url.hostname === "localhost" || url.hostname === "127.0.0.1");
}

// ../../../../packages/core/src/node/print-output.ts
function printOutput(result, mode) {
  const output = formatOutput(result, mode);
  process.stdout.write(`${output}
`);
}

// src/fetch-text.ts
async function fetchText(url, send) {
  let response;
  try {
    response = await send(url, { method: "GET", headers: { Accept: "text/plain, text/markdown, text/html" } });
  } catch {
    return { ok: false, problem: `Could not reach ${url}` };
  }
  if (!response.ok) {
    return { ok: false, status: response.status, problem: `${url} answered ${response.status}` };
  }
  return { ok: true, text: await response.text() };
}

// src/read-llms.ts
var LINK = /\[[^\]]*\]\([^)]+\)/g;
function readLlmsTxt(text) {
  const lines = text.split(/\r?\n/);
  const title = lines.find((line) => /^# /.test(line))?.slice(2).trim();
  const summary = lines.find((line) => /^> /.test(line))?.slice(2).trim();
  const sections = lines.filter((line) => /^## /.test(line)).map((line) => line.slice(3).trim());
  const read = { sections, links: (text.match(LINK) ?? []).length, words: wordsIn(text) };
  if (title) {
    read.title = title;
  }
  if (summary) {
    read.summary = summary;
  }
  return read;
}
function readLlmsFull(text) {
  return { items: text.split(/\r?\n/).filter((line) => /^### /.test(line)).length, words: wordsIn(text) };
}
function wordsIn(text) {
  return text.split(/\s+/).filter((word) => /\w/.test(word)).length;
}

// src/check-llms.ts
async function checkLlms(origin, send) {
  const txt = await fetchText(`${origin}/llms.txt`, send);
  const full = await fetchText(`${origin}/llms-full.txt`, send);
  return {
    origin,
    llmsTxt: txt.ok && looksLikeText(txt.text) ? { on: true, read: readLlmsTxt(txt.text) } : { on: false, problem: txt.ok ? `${origin}/llms.txt is a web page, not the file` : txt.problem },
    llmsFull: full.ok && looksLikeText(full.text) ? { on: true, read: readLlmsFull(full.text) } : { on: false, problem: full.ok ? `${origin}/llms-full.txt is a web page, not the file` : full.problem }
  };
}
function looksLikeText(text) {
  return !/^\s*<(!doctype|html)/i.test(text);
}

// src/describe.ts
function describeCheck(check) {
  const lines = [`llms-check: ${check.origin}`];
  if (check.llmsTxt.on) {
    const read = check.llmsTxt.read;
    lines.push(`/llms.txt: on, ${read.words} words, ${read.links} links`);
    lines.push(`  title: ${read.title ?? "none (it should start with a # title)"}`);
    lines.push(`  summary: ${read.summary ?? "none (a > line under the title says what the site is)"}`);
    lines.push(`  sections: ${read.sections.length > 0 ? read.sections.join(", ") : "none"}`);
  } else {
    lines.push(`/llms.txt: not on (${check.llmsTxt.problem})`);
  }
  if (check.llmsFull.on) {
    lines.push(`/llms-full.txt: on, ${check.llmsFull.read.items} pages and posts, ${check.llmsFull.read.words} words`);
  } else {
    lines.push(`/llms-full.txt: not on (${check.llmsFull.problem})`);
  }
  return lines.join("\n");
}

// src/read-args.ts
var USAGE = "node dist/run.js --address <https://...> [--json]";
function readArgs(args) {
  const at = args.indexOf("--address");
  const address = at >= 0 ? args[at + 1] : void 0;
  if (!address || address.startsWith("--")) {
    return { ok: false, problem: `Name the site with --address. Use: ${USAGE}` };
  }
  return { ok: true, address };
}

// src/site-address.ts
function siteAddress(written) {
  let url;
  try {
    url = new URL(written);
  } catch {
    return { ok: false, problem: `${written} is not a web address` };
  }
  if (url.protocol !== "https:" && !isLocalAddress(url)) {
    return { ok: false, problem: `${written} is not https://: a site is read over https (on this computer: http://localhost)` };
  }
  return { ok: true, origin: url.origin };
}

// src/run.ts
async function main(args) {
  const asked = readArgs(args);
  if (!asked.ok) {
    return failed(asked.problem);
  }
  const site = siteAddress(asked.address);
  if (!site.ok) {
    return failed(site.problem);
  }
  const check = await checkLlms(site.origin, (url, init) => fetch(url, init));
  printOutput({ text: describeCheck(check), data: check }, outputMode(args));
  return check.llmsTxt.on && check.llmsFull.on ? EXIT_DONE : EXIT_PROBLEMS_FOUND;
}
function failed(problem) {
  process.stderr.write(`${problem}
`);
  return EXIT_REFUSED_OR_FAILED;
}
process.exitCode = await main(process.argv.slice(2));
