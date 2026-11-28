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

// src/check-link.ts
var TRY_GET_AFTER = /* @__PURE__ */ new Set([403, 405, 501]);
async function checkLink(url, send) {
  const head = await ask(url, "HEAD", send);
  if (head.status !== void 0 && !TRY_GET_AFTER.has(head.status)) {
    return head;
  }
  return ask(url, "GET", send);
}
async function ask(url, method, send) {
  try {
    const response = await send(url, { method, redirect: "follow" });
    return response.status < 400 ? { url, works: true, status: response.status } : { url, works: false, status: response.status, problem: `answered ${response.status}` };
  } catch {
    return { url, works: false, problem: "could not be reached" };
  }
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

// src/page-links.ts
var HREF = /<a\b[^>]*?\bhref\s*=\s*["']([^"']+)["']/gi;
var NOT_A_PAGE = /^(mailto:|tel:|javascript:|#)/i;
function pageLinks(html, pageAddress) {
  const links = /* @__PURE__ */ new Set();
  for (const match of html.matchAll(HREF)) {
    const href = unescapeHtml(match[1].trim());
    if (href === "" || NOT_A_PAGE.test(href)) {
      continue;
    }
    try {
      const url = new URL(href, pageAddress);
      if (url.protocol === "http:" || url.protocol === "https:") {
        url.hash = "";
        links.add(url.href);
      }
    } catch {
    }
  }
  return [...links];
}
function unescapeHtml(text) {
  return text.replace(/&amp;/g, "&");
}

// src/sitemap.ts
function readSitemap(xml, origin) {
  const isIndex = /<sitemapindex[\s>]/i.test(xml);
  const addresses = [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)].map((match) => unescapeXml(match[1]));
  return { isIndex, addresses: addresses.filter((address) => onSite(address, origin)) };
}
function pagesAndPostsSitemaps(addresses) {
  const named = addresses.filter((address) => kindOfSitemap(address) !== void 0);
  const chosen = named.length > 0 ? named : addresses;
  return chosen.map((address) => ({ address, kind: kindOfSitemap(address) ?? "page" }));
}
function kindOfSitemap(address) {
  const name = address.toLowerCase().split("/").pop() ?? "";
  if (name.includes("post")) {
    return "post";
  }
  if (name.includes("page")) {
    return "page";
  }
  return void 0;
}
function onSite(address, origin) {
  try {
    return new URL(address).origin === origin;
  } catch {
    return false;
  }
}
function unescapeXml(text) {
  return text.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
}

// src/page-list.ts
async function pageList(origin, send, maxPages) {
  const pages = [`${origin}/`];
  const map = await fetchText(`${origin}/sitemap.xml`, send);
  if (map.ok) {
    const sitemap = readSitemap(map.text, origin);
    const listed = sitemap.isIndex ? await fromIndex(sitemap.addresses, origin, send) : sitemap.addresses;
    for (const page of listed) {
      if (!pages.includes(page)) {
        pages.push(page);
      }
    }
  }
  return { pages: pages.slice(0, maxPages), more: Math.max(0, pages.length - maxPages) };
}
async function fromIndex(sitemaps, origin, send) {
  const pages = [];
  for (const { address } of pagesAndPostsSitemaps(sitemaps)) {
    const map = await fetchText(address, send);
    if (map.ok) {
      pages.push(...readSitemap(map.text, origin).addresses);
    }
  }
  return pages;
}

// src/check-site.ts
async function checkSite(origin, send, wait, limits) {
  const { pages, more } = await pageList(origin, send, limits.maxPages);
  const onPages = /* @__PURE__ */ new Map();
  const pagesNotRead = [];
  for (const page of pages) {
    const read = await fetchText(page, send);
    if (!read.ok) {
      pagesNotRead.push(page);
      continue;
    }
    for (const link of pageLinks(read.text, page)) {
      onPages.set(link, [...onPages.get(link) ?? [], page]);
    }
    await wait(limits.pauseMs);
  }
  const links = [...onPages.keys()];
  const toCheck = links.slice(0, limits.maxLinks);
  const broken = [];
  for (const link of toCheck) {
    const result = await checkLink(link, send);
    if (!result.works) {
      broken.push({ ...result, onPages: onPages.get(link) ?? [] });
    }
    await wait(limits.pauseMs);
  }
  return {
    origin,
    pagesRead: pages.length - pagesNotRead.length,
    pagesNotRead,
    pagesOverLimit: more,
    linksChecked: toCheck.length,
    linksOverLimit: links.length - toCheck.length,
    broken
  };
}

// src/describe.ts
function describeCheck(check) {
  const lines = [`links-check: ${check.origin}`, `pages read: ${check.pagesRead}; links checked: ${check.linksChecked}`];
  if (check.pagesOverLimit > 0 || check.linksOverLimit > 0) {
    lines.push(`not read this time: ${check.pagesOverLimit} more pages, ${check.linksOverLimit} more links (over the limit)`);
  }
  for (const page of check.pagesNotRead) {
    lines.push(`page not read: ${page}`);
  }
  if (check.broken.length === 0) {
    lines.push("links that do not work: none");
  } else {
    lines.push(`links that do not work: ${check.broken.length}`);
    for (const link of check.broken) {
      lines.push(`  ${link.url}: ${link.problem}, on ${link.onPages.join(", ")}`);
    }
  }
  return lines.join("\n");
}

// src/read-args.ts
var USAGE = "node dist/run.js --address <https://...> [--max-pages <n>] [--json]";
var DEFAULT_MAX_PAGES = 50;
function readArgs(args) {
  const address = valueOf(args, "--address");
  if (!address) {
    return { ok: false, problem: `Name the site with --address. Use: ${USAGE}` };
  }
  const max = valueOf(args, "--max-pages");
  const maxPages = max === void 0 ? DEFAULT_MAX_PAGES : Number(max);
  if (!Number.isInteger(maxPages) || maxPages < 1) {
    return { ok: false, problem: `--max-pages is a whole number of pages, 1 or more. Use: ${USAGE}` };
  }
  return { ok: true, args: { address, maxPages } };
}
function valueOf(args, flag) {
  const at = args.indexOf(flag);
  const value = at >= 0 ? args[at + 1] : void 0;
  return value && !value.startsWith("--") ? value : void 0;
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
var MAX_LINKS = 300;
var PAUSE_MS = 250;
async function main(args) {
  const asked = readArgs(args);
  if (!asked.ok) {
    return failed(asked.problem);
  }
  const site = siteAddress(asked.args.address);
  if (!site.ok) {
    return failed(site.problem);
  }
  const wait = (ms) => new Promise((done) => setTimeout(done, ms));
  const check = await checkSite(site.origin, (url, init) => fetch(url, init), wait, { maxPages: asked.args.maxPages, maxLinks: MAX_LINKS, pauseMs: PAUSE_MS });
  printOutput({ text: describeCheck(check), data: check }, outputMode(args));
  return check.broken.length === 0 ? EXIT_DONE : EXIT_PROBLEMS_FOUND;
}
function failed(problem) {
  process.stderr.write(`${problem}
`);
  return EXIT_REFUSED_OR_FAILED;
}
process.exitCode = await main(process.argv.slice(2));
