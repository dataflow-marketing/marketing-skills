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

// src/count-site.ts
function countSite(items) {
  const posts = items.filter((item) => item.kind === "post");
  const counts = { pages: items.length - posts.length, posts: posts.length };
  if (posts.length > 0) {
    counts.wordsPerPost = wordsPerPost(posts.map((post) => wordCount(post.text)));
  }
  return counts;
}
function wordsPerPost(words) {
  const total = words.reduce((sum, each) => sum + each, 0);
  return { average: Math.round(total / words.length), fewest: Math.min(...words), most: Math.max(...words) };
}
function wordCount(text) {
  return text.split(/\s+/).filter((word) => /\w/.test(word)).length;
}

// src/counted-section.ts
function countedSection(counts, countedIn = "/llms-full.txt") {
  const lines = ["=== counted ===", `pages: ${counts.pages}, posts: ${counts.posts} (in ${countedIn})`];
  if (counts.wordsPerPost) {
    const { average, fewest, most } = counts.wordsPerPost;
    lines.push(`words per post: about ${average} on average, ${fewest} to ${most}`);
  }
  return lines.join("\n");
}

// src/describe-result.ts
function describeResult(read) {
  const lines = [`read the home page into ${read.homeFile}`, `read ${pagesRead(read)} into ${read.pagesFile}`];
  if (read.listed !== void 0 && read.listed > read.counts.pages + read.counts.posts) {
    lines.push(`the sitemap lists ${read.listed} pages: the first ${read.counts.pages + read.counts.posts} were read`);
  }
  lines.push(`kept the counts in ${read.countedFile}, for the profile's check`);
  lines.push("", "for the profile, word for word:", countedSection(read.counts, read.countedIn));
  return { text: lines.join("\n"), data: read };
}
function pagesRead(read) {
  if (read.countedIn === "the sitemap") {
    return "the pages the sitemap lists";
  }
  return "/llms-full.txt";
}

// src/fetch-text.ts
async function fetchText(url, send) {
  let response;
  try {
    response = await send(url, { method: "GET", headers: { Accept: "text/plain, text/html" } });
  } catch {
    return { ok: false, problem: `Could not reach ${url}` };
  }
  if (!response.ok) {
    return { ok: false, status: response.status, problem: `${url} answered ${response.status}` };
  }
  return { ok: true, text: await response.text() };
}

// src/no-llms-full.ts
function noLlmsFull(llmsFullUrl, problem) {
  return [
    `There is no ${llmsFullUrl} (${problem}).`,
    "Some site builders can make one: on Ghost it is on unless the site is private or the setting is off.",
    "Otherwise profile-make can read the pages the site's sitemap lists instead.",
    "Ask the person which; to read the sitemap, run this again with --from-sitemap."
  ].join("\n");
}

// src/node/write-site-files.ts
import { access, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
async function writeSiteFiles(folder, texts) {
  const files = {
    homeFile: join(folder, "home.txt"),
    pagesFile: join(folder, texts.pagesName),
    countedFile: join(folder, "counted.txt")
  };
  for (const file of [files.homeFile, files.pagesFile, files.countedFile]) {
    if (await exists(file)) {
      return { ok: false, problem: `${file} is already there. Delete it or name another folder with --folder.` };
    }
  }
  await mkdir(folder, { recursive: true });
  await writeFile(files.homeFile, texts.home);
  await writeFile(files.pagesFile, texts.pages);
  await writeFile(files.countedFile, `${texts.counted}
`);
  return { ok: true, files };
}
async function exists(file) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

// src/page-text.ts
var LEFT_OUT = /<(script|style|head|title|noscript|svg|nav|footer)\b[\s\S]*?<\/\1>/gi;
var BLOCK_END = /<\/(p|div|h[1-6]|li|section|article|header|footer|blockquote)>|<br\s*\/?>/gi;
var ANY_TAG = /<[^>]+>/g;
var ENTITIES = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&#x27;": "'",
  "&nbsp;": " ",
  "&rarr;": "→",
  "&larr;": "←",
  "&hellip;": "…",
  "&mdash;": "—",
  "&ndash;": "–",
  "&lsquo;": "‘",
  "&rsquo;": "’",
  "&ldquo;": "“",
  "&rdquo;": "”"
};
function pageText(html) {
  const withoutHidden = html.replace(LEFT_OUT, " ");
  const withBreaks = withoutHidden.replace(BLOCK_END, "\n");
  const withoutTags = withBreaks.replace(ANY_TAG, " ");
  return linesOf(putBackEntities(withoutTags)).join("\n");
}
function putBackEntities(text) {
  const named = text.replace(/&[a-z]+;|&#x27;|&#39;/gi, (entity) => ENTITIES[entity] ?? entity);
  return named.replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)));
}
function linesOf(text) {
  const lines = [];
  for (const raw of text.split("\n")) {
    const line = raw.replace(/\s+/g, " ").trim();
    if (line !== "") {
      lines.push(line);
    }
  }
  return lines;
}

// src/pages-text.ts
function pagesText(items) {
  const sections = [];
  for (const [kind, heading] of [["page", "## Pages"], ["post", "## Posts"]]) {
    const ofKind = items.filter((item) => item.kind === kind);
    if (ofKind.length > 0) {
      sections.push(heading, ...ofKind.map(itemText));
    }
  }
  return `${sections.join("\n")}
`;
}
function itemText(item) {
  return `### ${item.title}
URL: ${item.url}
${item.text.trim()}`;
}

// src/read-args.ts
var USAGE = "node dist/run.js --address <https://...> [--folder <folder>] [--from-sitemap] [--json]";
var DEFAULT_FOLDER = "site";
var VALUE_FLAGS = ["--address", "--folder"];
function readArgs(args) {
  const values = {};
  let fromSitemap = false;
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    const value = args[index + 1];
    if (arg === "--json") {
      continue;
    }
    if (arg === "--from-sitemap") {
      fromSitemap = true;
      continue;
    }
    if (VALUE_FLAGS.includes(arg) && value !== void 0 && !value.startsWith("--")) {
      values[arg] = value;
      index += 1;
      continue;
    }
    return { ok: false, problem: `Not understood: ${arg}. Use: ${USAGE}` };
  }
  const address = values["--address"];
  if (!address) {
    return { ok: false, problem: `Name the site's address with --address. Use: ${USAGE}` };
  }
  return { ok: true, args: { address, folder: values["--folder"] ?? DEFAULT_FOLDER, fromSitemap } };
}

// src/read-llms-full.ts
function readLlmsFull(text) {
  const lines = text.split(/\r?\n/);
  const items = [];
  let kind = "page";
  let current;
  lines.forEach((line, index) => {
    const section = sectionOf(line);
    if (section) {
      kind = section;
      current = void 0;
      return;
    }
    const startsItem = line.startsWith("### ") && (lines[index + 1] ?? "").startsWith("URL: ");
    if (startsItem) {
      current = { kind, title: line.slice(4).trim(), url: lines[index + 1].slice(5).trim(), text: "" };
      items.push(current);
      return;
    }
    if (current && !isItemDetail(line)) {
      current.text += `${line}
`;
    }
  });
  return items;
}
function sectionOf(line) {
  if (line.trim() === "## Pages") {
    return "page";
  }
  if (line.trim() === "## Posts") {
    return "post";
  }
  return void 0;
}
function isItemDetail(line) {
  return line.startsWith("URL: ") || line.startsWith("Last updated: ");
}

// src/page-title.ts
function pageTitle(html, address) {
  const match = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html);
  const title = match?.[1].replace(/\s+/g, " ").trim();
  return title ? title.replace(/&amp;/g, "&") : address;
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

// src/read-sitemap-pages.ts
var PAGE_LIMIT = 50;
async function readSitemapPages(origin, send) {
  const listed = await listedPages(origin, send);
  if (!listed.ok) {
    return listed;
  }
  const items = [];
  for (const page of listed.pages.slice(0, PAGE_LIMIT)) {
    const fetched = await fetchText(page.address, send);
    if (fetched.ok) {
      items.push({ kind: page.kind, title: pageTitle(fetched.text, page.address), url: page.address, text: pageText(fetched.text) });
    }
  }
  return { ok: true, items, listed: listed.pages.length };
}
async function listedPages(origin, send) {
  const top = await fetchText(`${origin}/sitemap.xml`, send);
  if (!top.ok) {
    return { ok: false, problem: `There is no ${origin}/sitemap.xml either (${top.problem}).` };
  }
  const sitemap = readSitemap(top.text, origin);
  if (!sitemap.isIndex) {
    return { ok: true, pages: sitemap.addresses.map((address) => ({ address, kind: "page" })) };
  }
  const pages = [];
  for (const child of pagesAndPostsSitemaps(sitemap.addresses)) {
    const fetched = await fetchText(child.address, send);
    if (fetched.ok) {
      const addresses = readSitemap(fetched.text, origin).addresses;
      pages.push(...addresses.map((address) => ({ address, kind: child.kind })));
    }
  }
  return { ok: true, pages };
}

// src/site-urls.ts
function siteUrls(address) {
  let url;
  try {
    url = new URL(address);
  } catch {
    return { ok: false, problem: `Not a web address: ${address}` };
  }
  if (url.protocol !== "https:" && !isLocalAddress(url)) {
    return { ok: false, problem: "The address must start with https:// (or be http://localhost for a site on this computer)" };
  }
  const home = `${url.origin}/`;
  return { ok: true, home, llmsFull: `${url.origin}/llms-full.txt` };
}

// src/run.ts
async function main(args) {
  const output = outputMode(args);
  const asked = readArgs(args);
  if (!asked.ok) {
    return failed(asked.problem);
  }
  const urls = siteUrls(asked.args.address);
  if (!urls.ok) {
    return failed(urls.problem);
  }
  const pages = await readPages(urls.llmsFull, new URL(urls.home).origin, asked.args.fromSitemap);
  if (!pages.ok) {
    return failed(pages.problem);
  }
  const home = await fetchText(urls.home, fetch);
  if (!home.ok) {
    return failed(home.problem);
  }
  const counts = countSite(pages.read.items);
  const written = await writeSiteFiles(asked.args.folder, {
    home: pageText(home.text),
    pages: pages.read.text,
    pagesName: pages.read.fileName,
    counted: countedSection(counts, pages.read.countedIn)
  });
  if (!written.ok) {
    return failed(written.problem);
  }
  printOutput(describeResult({ ...written.files, countedIn: pages.read.countedIn, counts, listed: pages.read.listed }), output);
  return EXIT_DONE;
}
async function readPages(llmsFullUrl, origin, fromSitemap) {
  if (fromSitemap) {
    const read = await readSitemapPages(origin, fetch);
    if (!read.ok) {
      return read;
    }
    const text = pagesText(read.items);
    return { ok: true, read: { text, fileName: "pages.txt", countedIn: "the sitemap", items: read.items, listed: read.listed } };
  }
  const llmsFull = await fetchText(llmsFullUrl, fetch);
  if (!llmsFull.ok) {
    return { ok: false, problem: noLlmsFull(llmsFullUrl, llmsFull.problem) };
  }
  const items = readLlmsFull(llmsFull.text);
  return { ok: true, read: { text: llmsFull.text, fileName: "llms-full.txt", countedIn: "/llms-full.txt", items } };
}
function failed(problem) {
  process.stderr.write(`${problem}
`);
  return EXIT_REFUSED_OR_FAILED;
}
process.exitCode = await main(process.argv.slice(2));
