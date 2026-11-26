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

// ../../../../packages/core/src/node/print-output.ts
function printOutput(result, mode) {
  const output = formatOutput(result, mode);
  process.stdout.write(`${output}
`);
}

// src/find-whole.ts
var LETTER_OR_DIGIT = /[\p{L}\p{N}]/u;
function findWhole(haystack, needle) {
  if (needle === "") {
    return -1;
  }
  let from = 0;
  while (from <= haystack.length) {
    const at = haystack.indexOf(needle, from);
    if (at < 0) {
      return -1;
    }
    if (standsAlone(haystack, needle, at)) {
      return at;
    }
    from = at + 1;
  }
  return -1;
}
function standsAlone(haystack, needle, at) {
  const before = haystack.charAt(at - 1);
  const after = haystack.charAt(at + needle.length);
  const needleStartsWord = LETTER_OR_DIGIT.test(needle.charAt(0));
  const needleEndsWord = LETTER_OR_DIGIT.test(needle.charAt(needle.length - 1));
  if (needleStartsWord && LETTER_OR_DIGIT.test(before)) {
    return false;
  }
  if (needleEndsWord && LETTER_OR_DIGIT.test(after)) {
    return false;
  }
  return true;
}

// src/find-in-source.ts
function findInSource(mention, index) {
  if (mention.kind === "quote" || mention.kind === "name") {
    return findWords(mention.key, index.searchable);
  }
  if (mention.kind === "number") {
    return index.numbers.get(mention.key);
  }
  if (mention.kind === "money") {
    return index.money.get(mention.key);
  }
  return void 0;
}
function findWords(words, sources) {
  for (const source of sources) {
    const at = findWhole(source.text, words);
    if (at >= 0) {
      return { source: source.name, line: lineAt(source, at) };
    }
  }
  return void 0;
}
function lineAt(source, offset) {
  let line = 0;
  for (const start of source.lineStarts) {
    if (start.offset > offset) {
      break;
    }
    line = start.line;
  }
  return line;
}

// src/compare-with-sources.ts
var REPORT_ORDER = {
  quote: 0,
  name: 1,
  number: 2,
  money: 2,
  claim: 3
};
function compareWithSources(mentions, index) {
  const lines = [];
  const seen = /* @__PURE__ */ new Set();
  for (const mention of onePerKey(mentions, seen)) {
    const where = findInSource(mention, index);
    if (where) {
      lines.push({ kind: mention.kind, written: mention.written, found: true, where });
    } else {
      lines.push({ kind: mention.kind, written: mention.written, found: false });
    }
  }
  return lines.sort((first, second) => REPORT_ORDER[first.kind] - REPORT_ORDER[second.kind]);
}
function onePerKey(mentions, seen) {
  const kept = [];
  for (const mention of mentions) {
    const id = `${mention.kind} ${mention.key}`;
    if (!seen.has(id)) {
      seen.add(id);
      kept.push(mention);
    }
  }
  return kept;
}

// src/content-lines.ts
var SPEC_LINE = /^spec \d+$/;
var SECTION_MARKER = /^=== .+ ===$/;
var BODY_MARKER = "=== body ===";
var FIELDS_NOT_WORDS = ["kind", "state", "channel", "link", "from"];
function contentLines(text) {
  const lines = text.split(/\r?\n/);
  const bodyAt = lines.findIndex((line) => line.trim() === BODY_MARKER);
  return lines.map((line, index) => {
    if (isFormatLine(line, index, bodyAt)) {
      return "";
    }
    return line;
  });
}
function isFormatLine(line, index, bodyAt) {
  const trimmed = line.trim();
  if (index === 0 && SPEC_LINE.test(trimmed)) {
    return true;
  }
  if (SECTION_MARKER.test(trimmed)) {
    return true;
  }
  const inWordsHeader = bodyAt >= 0 && index < bodyAt;
  if (inWordsHeader && isFieldNotWords(trimmed)) {
    return true;
  }
  return false;
}
function isFieldNotWords(line) {
  for (const field of FIELDS_NOT_WORDS) {
    if (line.startsWith(`${field}:`)) {
      return true;
    }
  }
  return false;
}

// src/blank-out.ts
function blankOut(line, spans) {
  let result = line;
  for (const span of spans) {
    const before = result.slice(0, span.start);
    const blank = " ".repeat(span.end - span.start);
    const after = result.slice(span.end);
    result = before + blank + after;
  }
  return result;
}

// src/number-key.ts
var ONE_NUMBER = /^\d+(?:\.\d+)?$/;
function numberKey(written) {
  const bare = written.replaceAll(",", "");
  if (ONE_NUMBER.test(bare)) {
    return String(Number(bare));
  }
  return bare;
}

// src/find-money.ts
var AMOUNT = String.raw`\d[\d,]*(?:\.\d+)?`;
var SYMBOL_THEN_AMOUNT = new RegExp(String.raw`(A\$|US\$|NZ\$|\$|\u00A3|\u20AC)\s?(${AMOUNT})`, "g");
var CODE_THEN_AMOUNT = new RegExp(String.raw`\b(AUD|USD|NZD|GBP|EUR)\s?(${AMOUNT})`, "g");
var AMOUNT_THEN_NAME = new RegExp(String.raw`(${AMOUNT})\s?(dollars?|euros?|AUD|USD|NZD|GBP|EUR)\b`, "gi");
var NAME_ALONE = /\b(dollars?|euros?|AUD|USD|NZD|GBP|EUR)\b/gi;
var CURRENCIES = {
  "$": "dollar",
  dollar: "dollar",
  dollars: "dollar",
  "a$": "AUD",
  aud: "AUD",
  "us$": "USD",
  usd: "USD",
  "nz$": "NZD",
  nzd: "NZD",
  "£": "GBP",
  gbp: "GBP",
  "€": "EUR",
  eur: "EUR",
  euro: "EUR",
  euros: "EUR"
};
function findMoney(line) {
  const found = [];
  for (const match of line.matchAll(SYMBOL_THEN_AMOUNT)) {
    addIfFree(found, match, match[1], match[2]);
  }
  for (const match of line.matchAll(CODE_THEN_AMOUNT)) {
    addIfFree(found, match, match[1], match[2]);
  }
  for (const match of line.matchAll(AMOUNT_THEN_NAME)) {
    addIfFree(found, match, match[2], match[1]);
  }
  for (const match of line.matchAll(NAME_ALONE)) {
    addIfFree(found, match, match[1], "");
  }
  return found.sort((first, second) => first.start - second.start);
}
function currencyOf(key) {
  return key.split(" ")[0];
}
function addIfFree(found, match, currency, amount) {
  const start = match.index ?? 0;
  const end = start + match[0].length;
  for (const taken of found) {
    if (start < taken.end && taken.start < end) {
      return;
    }
  }
  found.push({ start, end, written: match[0], key: moneyKey(currency, amount) });
}
function moneyKey(currency, amount) {
  const name = CURRENCIES[currency.toLowerCase()];
  if (amount === "") {
    return name;
  }
  return `${name} ${numberKey(amount)}`;
}

// src/find-names.ts
var CAPITALISED_WORD = new RegExp("(?<![\\p{L}\\p{N}])\\p{Lu}\\p{L}+", "gu");
var OPENING_MARKS = /[\s(["'\u201C\u2018]+$/;
var ONLY_A_LIST_MARKER = /^[\s\-*+>#]*$/;
var ENDS_A_SENTENCE = /[.!?:]$/;
var OPENS_A_QUOTE = /["\u201C]$/;
function findNames(line, asWritten = line) {
  const found = [];
  for (const match of line.matchAll(CAPITALISED_WORD)) {
    const start = match.index ?? 0;
    if (startsASentence(asWritten.slice(0, start))) {
      continue;
    }
    found.push({ start, end: start + match[0].length, written: match[0] });
  }
  return found;
}
function startsASentence(before) {
  if (OPENS_A_QUOTE.test(before)) {
    return true;
  }
  const withoutOpeningMarks = before.replace(OPENING_MARKS, "");
  if (ONLY_A_LIST_MARKER.test(withoutOpeningMarks)) {
    return true;
  }
  return ENDS_A_SENTENCE.test(withoutOpeningMarks);
}

// src/number-words.ts
var SMALL = {
  zero: 0,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  thirteen: 13,
  fourteen: 14,
  fifteen: 15,
  sixteen: 16,
  seventeen: 17,
  eighteen: 18,
  nineteen: 19,
  twenty: 20,
  thirty: 30,
  forty: 40,
  fifty: 50,
  sixty: 60,
  seventy: 70,
  eighty: 80,
  ninety: 90
};
var SCALES = {
  hundred: 100,
  thousand: 1e3,
  million: 1e6
};
var WORD = new RegExp("\\p{L}+", "gu");
var JOINS_WORDS = /^[ -]$/;
var JOINS_AFTER_A_SCALE = /^ and $/;
function findNumberWords(line) {
  const found = [];
  let run = [];
  for (const word of wordsIn(line)) {
    if (word.text === "and" && endsWithAScale(run)) {
      continue;
    }
    if (!isNumberWord(word.text)) {
      found.push(...finishRun(line, run));
      run = [];
      continue;
    }
    if (run.length > 0 && !joinsRun(line, run[run.length - 1], word)) {
      found.push(...finishRun(line, run));
      run = [];
    }
    run.push(word);
  }
  found.push(...finishRun(line, run));
  return found;
}
function wordsIn(line) {
  const words = [];
  for (const match of line.matchAll(WORD)) {
    const start = match.index ?? 0;
    words.push({ start, end: start + match[0].length, text: match[0].toLowerCase() });
  }
  return words;
}
function isNumberWord(text) {
  return text in SMALL || text in SCALES;
}
function endsWithAScale(run) {
  if (run.length === 0) {
    return false;
  }
  return run[run.length - 1].text in SCALES;
}
function joinsRun(line, last, next) {
  const between = line.slice(last.end, next.start);
  if (JOINS_WORDS.test(between)) {
    return true;
  }
  return last.text in SCALES && JOINS_AFTER_A_SCALE.test(between);
}
function finishRun(line, run) {
  if (run.length === 0) {
    return [];
  }
  const start = run[0].start;
  const end = run[run.length - 1].end;
  const value = valueOf(run.map((word) => word.text));
  return [{ start, end, written: line.slice(start, end), value }];
}
function valueOf(words) {
  let total = 0;
  let current = 0;
  for (const word of words) {
    if (word in SMALL) {
      current += SMALL[word];
    } else if (word === "hundred") {
      current = Math.max(current, 1) * SCALES.hundred;
    } else {
      total += Math.max(current, 1) * SCALES[word];
      current = 0;
    }
  }
  return total + current;
}

// src/find-numbers.ts
var FIGURES = /\d(?:[\d,.]*\d)?/g;
function findNumbers(line) {
  const found = [];
  for (const match of line.matchAll(FIGURES)) {
    const start = match.index ?? 0;
    found.push({
      start,
      end: start + match[0].length,
      written: match[0],
      key: numberKey(match[0])
    });
  }
  for (const words of findNumberWords(line)) {
    found.push({
      start: words.start,
      end: words.end,
      written: words.written,
      key: String(words.value)
    });
  }
  return found.sort((first, second) => first.start - second.start);
}

// src/find-quotes.ts
var QUOTE_MARK = /["\u201C\u201D]/g;
function findQuotes(line) {
  const marks = quoteMarkPositions(line);
  const quotes = [];
  for (let index = 0; index + 1 < marks.length; index += 2) {
    const open = marks[index];
    const close = marks[index + 1];
    quotes.push({
      start: open,
      end: close + 1,
      inner: line.slice(open + 1, close)
    });
  }
  const unpaired = marks.length % 2 === 1;
  return { quotes, unpaired };
}
function quoteMarkPositions(line) {
  const positions = [];
  for (const match of line.matchAll(QUOTE_MARK)) {
    positions.push(match.index ?? 0);
  }
  return positions;
}

// src/find-urls.ts
var ADDRESS = /(?:https?:\/\/|www\.)\S+/g;
function findUrls(line) {
  const spans = [];
  for (const match of line.matchAll(ADDRESS)) {
    const start = match.index ?? 0;
    spans.push({ start, end: start + match[0].length });
  }
  return spans;
}

// src/plain.ts
function plain(text) {
  let result = text;
  result = result.replace(/[\u2018\u2019]/g, "'");
  result = result.replace(/[\u201C\u201D]/g, '"');
  result = result.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
  result = result.replace(/\*\*|__/g, "");
  result = result.replace(/\s+/g, " ");
  return result.trim().toLowerCase();
}

// src/find-mentions.ts
var PUNCTUATION_AT_THE_ENDS = /^[\s.,;:!?()]+|[\s.,;:!?()]+$/g;
function findMentions(lines) {
  const mentions = [];
  lines.forEach((original, index) => {
    const textLine = index + 1;
    let line = blankOut(original, findUrls(original));
    const quotes = findQuotes(line);
    for (const quote of quotes.quotes) {
      const key = quoteKey(quote.inner);
      if (key !== "") {
        mentions.push({ kind: "quote", written: `"${quote.inner}"`, key, textLine });
      }
    }
    if (quotes.unpaired) {
      const written = `a quote mark with no pair on line ${textLine} of the text`;
      mentions.push({ kind: "claim", written, key: written, textLine });
    }
    line = blankOut(line, quotes.quotes);
    const money = findMoney(line);
    for (const amount of money) {
      mentions.push({ kind: "money", written: amount.written, key: amount.key, textLine });
    }
    line = blankOut(line, money);
    const numbers = findNumbers(line);
    for (const number of numbers) {
      mentions.push({ kind: "number", written: number.written, key: number.key, textLine });
    }
    line = blankOut(line, numbers);
    for (const name of findNames(line, original)) {
      mentions.push({ kind: "name", written: name.written, key: plain(name.written), textLine });
    }
  });
  return mentions;
}
function quoteKey(inner) {
  return plain(inner).replace(PUNCTUATION_AT_THE_ENDS, "");
}

// src/index-sources.ts
function indexSources(sources) {
  const index = {
    searchable: [],
    numbers: /* @__PURE__ */ new Map(),
    money: /* @__PURE__ */ new Map()
  };
  for (const source of sources) {
    index.searchable.push(searchable(source));
    addNumbersAndMoney(index, source);
  }
  return index;
}
function searchable(source) {
  const lineStarts = [];
  let text = "";
  source.text.split(/\r?\n/).forEach((original, index) => {
    const line = plain(original);
    if (line === "") {
      return;
    }
    if (text !== "") {
      text += " ";
    }
    lineStarts.push({ offset: text.length, line: index + 1 });
    text += line;
  });
  return { name: source.name, text, lineStarts };
}
function addNumbersAndMoney(index, source) {
  source.text.split(/\r?\n/).forEach((line, lineIndex) => {
    const where = { source: source.name, line: lineIndex + 1 };
    for (const number of findNumbers(line)) {
      keepFirst(index.numbers, number.key, where);
    }
    for (const amount of findMoney(line)) {
      keepFirst(index.money, amount.key, where);
      keepFirst(index.money, currencyOf(amount.key), where);
    }
  });
}
function keepFirst(found, key, where) {
  if (!found.has(key)) {
    found.set(key, where);
  }
}

// src/check-text.ts
function checkText(text, sources) {
  const lines = contentLines(text);
  const mentions = findMentions(lines);
  const index = indexSources(sources);
  const checked = compareWithSources(mentions, index);
  return { lines: checked, problems: countProblems(checked) };
}
function countProblems(lines) {
  let problems = 0;
  for (const line of lines) {
    if (!line.found) {
      problems += 1;
    }
  }
  return problems;
}

// src/node/read-text-files.ts
import { readFile } from "node:fs/promises";
async function readTextFiles(files) {
  const text = await readOne(files.text);
  if (text === void 0) {
    return { ok: false, problem: `Cannot read the text: ${files.text}` };
  }
  const sources = [];
  for (const name of files.against) {
    const sourceText = await readOne(name);
    if (sourceText === void 0) {
      return { ok: false, problem: `Cannot read the source: ${name}` };
    }
    sources.push({ name, text: sourceText });
  }
  return { ok: true, text, sources };
}
async function readOne(path) {
  try {
    return await readFile(path, "utf8");
  } catch {
    return void 0;
  }
}

// src/read-args.ts
var USAGE = "node dist/run.js --text <file> --against <file> [--against <file>] [--json]";
function readArgs(args) {
  let text;
  const against = [];
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    const value = args[index + 1];
    if (arg === "--json") {
      continue;
    }
    if ((arg === "--text" || arg === "--against") && isValue(value)) {
      if (arg === "--text") {
        text = value;
      } else {
        against.push(value);
      }
      index += 1;
      continue;
    }
    return { ok: false, problem: `Not understood: ${arg}. Use: ${USAGE}` };
  }
  if (!text || against.length === 0) {
    return { ok: false, problem: `Name a text and its source. Use: ${USAGE}` };
  }
  return { ok: true, files: { text, against } };
}
function isValue(value) {
  return value !== void 0 && !value.startsWith("--");
}

// src/write-report.ts
var LABELS = {
  quote: "quote",
  name: "name",
  number: "number",
  money: "number",
  claim: "claim to read"
};
function writeReport(files, result) {
  const severalSources = files.against.length > 1;
  const lines = [];
  lines.push("spec 1");
  lines.push(`checked: ${files.checked}`);
  for (const source of files.against) {
    lines.push(`against: ${source}`);
  }
  lines.push(`result: ${resultWords(result.problems)}`);
  lines.push("");
  for (const line of result.lines) {
    lines.push(reportLine(line, severalSources));
  }
  return { text: lines.join("\n").trimEnd(), data: reportData(files, result) };
}
function resultWords(problems) {
  if (problems === 0) {
    return "passed";
  }
  if (problems === 1) {
    return "1 problem";
  }
  return `${problems} problems`;
}
function reportLine(line, severalSources) {
  const label = LABELS[line.kind];
  if (line.kind === "claim") {
    return `${label}: ${line.written}`;
  }
  if (!line.found || !line.where) {
    return `${label} not found: ${line.written}`;
  }
  return `${label} found: ${line.written} (${whereWords(line.where, severalSources)})`;
}
function whereWords(where, severalSources) {
  if (severalSources) {
    return `${where.source} line ${where.line}`;
  }
  return `line ${where.line}`;
}
function reportData(files, result) {
  return {
    spec: 1,
    checked: files.checked,
    against: files.against,
    result: result.problems === 0 ? "passed" : "problems",
    problems: result.problems,
    lines: result.lines
  };
}

// src/run.ts
async function main(args) {
  const mode = outputMode(args);
  const asked = readArgs(args);
  if (!asked.ok) {
    return failed(asked.problem);
  }
  const read = await readTextFiles(asked.files);
  if (!read.ok) {
    return failed(read.problem);
  }
  const result = checkText(read.text, read.sources);
  const report = writeReport({ checked: asked.files.text, against: asked.files.against }, result);
  printOutput(report, mode);
  if (result.problems > 0) {
    return EXIT_PROBLEMS_FOUND;
  }
  return EXIT_DONE;
}
function failed(problem) {
  process.stderr.write(`${problem}
`);
  return EXIT_REFUSED_OR_FAILED;
}
process.exitCode = await main(process.argv.slice(2));
