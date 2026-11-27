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

// ../../../../packages/core/src/keys/parse-keys-file.ts
var KEY_LINE = /^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/;
function parseKeysFile(text) {
  const keys = {};
  const lines = text.split(/\r?\n/);
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (line === "" || line.startsWith("#")) {
      continue;
    }
    const match = KEY_LINE.exec(line);
    if (!match) {
      continue;
    }
    keys[match[1]] = valueOf(match[2].trim());
  }
  return keys;
}
function valueOf(text) {
  const quote = text[0];
  if (quote === '"' || quote === "'") {
    const closing = text.indexOf(quote, 1);
    if (closing > 0) {
      return text.slice(1, closing);
    }
  }
  const note = text.indexOf(" #");
  if (note >= 0) {
    return text.slice(0, note).trim();
  }
  return text;
}

// ../../../../packages/core/src/keys/find-key.ts
var MissingKeyError = class extends Error {
  keyName;
  constructor(keyName) {
    super(`No key named ${keyName}. Add it to the keys file named in settings.`);
    this.name = "MissingKeyError";
    this.keyName = keyName;
  }
};
function findKey(keys, keyName) {
  const value = keys[keyName];
  if (value === void 0 || value === "") {
    throw new MissingKeyError(keyName);
  }
  return value;
}

// ../../../../node_modules/.pnpm/jose@6.2.17/node_modules/jose/dist/webapi/lib/buffer_utils.js
var encoder = new TextEncoder();
var decoder = new TextDecoder();
var strictDecoder = new TextDecoder("utf-8", { fatal: true });
var UINT32_RANGE = 2 ** 32;
function concat(...buffers) {
  const size = buffers.reduce((acc, { length }) => acc + length, 0), buf = new Uint8Array(size);
  let i = 0;
  for (const buffer of buffers)
    buf.set(buffer, i), i += buffer.length;
  return buf;
}
var NON_ASCII = /[^\x00-\x7f]/;
function encode(string) {
  if (typeof string == "string" && string.length >= 128) {
    if (NON_ASCII.test(string))
      throw new TypeError("non-ASCII string encountered in encode()");
    return encoder.encode(string);
  }
  const bytes = new Uint8Array(string.length);
  for (let i = 0; i < string.length; i++) {
    const code = string.charCodeAt(i);
    if (code > 127)
      throw new TypeError("non-ASCII string encountered in encode()");
    bytes[i] = code;
  }
  return bytes;
}
function encodeBase64(input, url = false) {
  if (Uint8Array.prototype.toBase64)
    return input.toBase64({ alphabet: url ? "base64url" : "base64", omitPadding: url });
  const CHUNK_SIZE = 32768, arr = [];
  for (let i = 0; i < input.length; i += CHUNK_SIZE)
    arr.push(String.fromCharCode.apply(null, input.subarray(i, i + CHUNK_SIZE)));
  const encoded = btoa(arr.join(""));
  return url ? encoded.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_") : encoded;
}
function decodeBase64(encoded, url = false) {
  if (Uint8Array.fromBase64)
    return Uint8Array.fromBase64(encoded, { alphabet: url ? "base64url" : "base64" });
  if (url) {
    if (encoded.includes("+") || encoded.includes("/"))
      throw new TypeError("Invalid base64url");
    encoded = encoded.replace(/-/g, "+").replace(/_/g, "/");
  }
  const binary = atob(encoded), bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++)
    bytes[i] = binary.charCodeAt(i);
  return bytes;
}

// ../../../../node_modules/.pnpm/jose@6.2.17/node_modules/jose/dist/webapi/util/errors.js
var JOSEError = class extends Error {
  static code = "ERR_JOSE_GENERIC";
  code = "ERR_JOSE_GENERIC";
  constructor(message2, options) {
    super(message2, options), this.name = this.constructor.name, Error.captureStackTrace?.(this, this.constructor);
  }
};
var JOSENotSupported = class extends JOSEError {
  static code = "ERR_JOSE_NOT_SUPPORTED";
  code = "ERR_JOSE_NOT_SUPPORTED";
};
var JWSInvalid = class extends JOSEError {
  static code = "ERR_JWS_INVALID";
  code = "ERR_JWS_INVALID";
};
var JWTInvalid = class extends JOSEError {
  static code = "ERR_JWT_INVALID";
  code = "ERR_JWT_INVALID";
};

// ../../../../node_modules/.pnpm/jose@6.2.17/node_modules/jose/dist/webapi/util/base64url.js
var invalid = "The input to be decoded is not correctly encoded.";
function decode(input) {
  try {
    return decodeBase64(typeof input == "string" ? input : decoder.decode(input), true);
  } catch (cause) {
    throw new TypeError(invalid, { cause });
  }
}
function encode2(input) {
  return encodeBase64(typeof input == "string" ? encoder.encode(input) : input, true);
}

// ../../../../node_modules/.pnpm/jose@6.2.17/node_modules/jose/dist/webapi/lib/validate.js
function isObject(input) {
  if (typeof input != "object" || input === null || Object.prototype.toString.call(input) !== "[object Object]")
    return false;
  const prototype = Object.getPrototypeOf(input);
  return prototype === null || Object.getPrototypeOf(prototype) === null;
}
function isDisjoint(...headers) {
  const parameters = /* @__PURE__ */ new Set();
  for (const header of headers)
    if (header)
      for (const parameter of Object.keys(header)) {
        if (parameters.has(parameter))
          return false;
        parameters.add(parameter);
      }
  return true;
}
function assertNotSet(value, name) {
  if (value !== void 0)
    throw new TypeError(`${name} can only be called once`);
}
var JWS_RECOGNIZED = { __proto__: null, b64: true };
function validateCritDuplicates(Err, protectedHeader) {
  const { crit } = protectedHeader ?? {};
  if (Array.isArray(crit) && new Set(crit).size !== crit.length)
    throw new Err('"crit" (Critical) Header Parameter MUST NOT contain duplicate values');
}
function validateCrit(Err, recognizedDefault, recognizedOption, protectedHeader, joseHeader) {
  if (joseHeader.crit !== void 0 && protectedHeader?.crit === void 0)
    throw new Err('"crit" (Critical) Header Parameter MUST be integrity protected');
  if (!protectedHeader || protectedHeader.crit === void 0)
    return [];
  if (!Array.isArray(protectedHeader.crit) || protectedHeader.crit.length === 0 || protectedHeader.crit.some((input) => typeof input != "string" || input.length === 0))
    throw new Err('"crit" (Critical) Header Parameter MUST be an array of non-empty strings when present');
  const recognized = recognizedOption === void 0 ? recognizedDefault : { __proto__: null, ...recognizedOption, ...recognizedDefault };
  for (const parameter of protectedHeader.crit) {
    if (!(parameter in recognized))
      throw new JOSENotSupported(`Extension Header Parameter "${parameter}" is not recognized`);
    if (!Object.hasOwn(joseHeader, parameter) || joseHeader[parameter] === void 0)
      throw new Err(`Extension Header Parameter "${parameter}" is missing`);
    if (recognized[parameter] && (!Object.hasOwn(protectedHeader, parameter) || protectedHeader[parameter] === void 0))
      throw new Err(`Extension Header Parameter "${parameter}" MUST be integrity protected`);
  }
  return protectedHeader.crit;
}
function validateB64(protectedHeader, extensions) {
  if (extensions.includes("b64")) {
    const b64 = protectedHeader.b64;
    if (typeof b64 != "boolean")
      throw new JWSInvalid('The "b64" (base64url-encode payload) Header Parameter must be a boolean');
    return b64;
  }
  return true;
}
function serializeJoseHeader(Err, header) {
  let serialized, parsed;
  try {
    serialized = JSON.stringify(header), parsed = JSON.parse(serialized);
  } catch (cause) {
    throw new Err("JOSE Header is not valid JSON", { cause });
  }
  if (!isObject(parsed))
    throw new Err("JOSE Header is not a JSON object");
  return [parsed, serialized];
}

// ../../../../node_modules/.pnpm/jose@6.2.17/node_modules/jose/dist/webapi/lib/key.js
var tag = (key) => key[Symbol.toStringTag];
var jwkMatchesOp = (entry, key, usage) => {
  const { alg } = entry;
  if (key.use !== void 0) {
    const expected = usage === "sign" || usage === "verify" ? "sig" : "enc";
    if (key.use !== expected)
      throw new TypeError(`Invalid key for this operation, its "use" must be "${expected}" when present`);
  }
  if (key.alg !== void 0 && key.alg !== alg)
    throw new TypeError(`Invalid key for this operation, its "alg" must be "${alg}" when present`);
  if (Array.isArray(key.key_ops)) {
    const expectedKeyOp = usage === "encrypt" || usage === "decrypt" ? entry.ops?.[usage === "encrypt" ? 0 : 1] : usage;
    if (expectedKeyOp && !key.key_ops.includes(expectedKeyOp))
      throw new TypeError(`Invalid key for this operation, its "key_ops" must include "${expectedKeyOp}" when present`);
  }
};
async function prepareKey(entry, key, usage) {
  const { alg, secret } = entry, requiresPrivateKey = usage === "decrypt" || usage === "sign";
  if (secret && key instanceof Uint8Array)
    return key;
  let normalized, keyObject;
  if (isObject(key)) {
    if (normalized = normalizeJwk(key), typeof normalized.kty != "string")
      throw invalidKeyType(alg, key, secret);
    if (!(secret ? normalized.kty === "oct" && typeof normalized.k == "string" : normalized.kty !== "oct" && (requiresPrivateKey ? normalized.kty === "AKP" && typeof normalized.priv == "string" || typeof normalized.d == "string" : normalized.d === void 0 && normalized.priv === void 0)))
      throw new TypeError(secret ? 'JSON Web Key for symmetric algorithms must have JWK "kty" (Key Type) equal to "oct" and the JWK "k" (Key Value) present' : `JSON Web Key for this operation must be a ${requiresPrivateKey ? "private" : "public"} JWK`);
    if (jwkMatchesOp(entry, normalized, usage), normalized.kty === "oct")
      return decode(normalized.k);
    if (!Object.isFrozen(key)) {
      const { key_ops } = key;
      Array.isArray(key_ops) && Object.freeze(key_ops), Object.freeze(key);
    }
  } else {
    if (!isKeyLike(key))
      throw invalidKeyType(alg, key, secret);
    const expectedType = secret ? "secret" : requiresPrivateKey ? "private" : "public";
    if (key.type !== expectedType && (secret || ["secret", "public", "private"].includes(key.type)))
      throw new TypeError(`${tag(key)} instances must be of type "${expectedType}" for the ${alg} algorithm`);
    if (isCryptoKey(key))
      return key;
    if (keyObject = key, keyObject.type === "secret")
      return keyObject.export();
  }
  cache ||= /* @__PURE__ */ new WeakMap();
  const cacheKey = key;
  let cached = cache.get(cacheKey);
  if (cached?.[alg])
    return cached[alg];
  if (cached || cache.set(cacheKey, cached = {}), keyObject && typeof keyObject.toCryptoKey == "function") {
    const isPublic = keyObject.type === "public", crv = nist[keyObject.asymmetricKeyDetails?.namedCurve], params = entry.resolve?.({ crv, asymmetricKeyType: keyObject.asymmetricKeyType }) ?? entry.subtle;
    return cached[alg] = keyObject.toCryptoKey(params, isPublic, entry.usages[isPublic ? 0 : 1]);
  }
  return normalized ??= keyObject.export({ format: "jwk" }), normalized.alg = alg, cached[alg] = await jwkToKey(entry, normalized);
}
var cache;
var nist = {
  __proto__: null,
  prime256v1: "P-256",
  secp384r1: "P-384",
  secp521r1: "P-521"
};
var isCryptoKey = (key) => {
  if (key?.[Symbol.toStringTag] === "CryptoKey")
    return true;
  try {
    return key instanceof CryptoKey;
  } catch {
    return false;
  }
};
var isKeyObject = (key) => key?.[Symbol.toStringTag] === "KeyObject";
var isKeyLike = (key) => isCryptoKey(key) || isKeyObject(key);
function message(msg, actual, ...types) {
  if (types.length > 2) {
    const last = types.pop();
    msg += `one of type ${types.join(", ")}, or ${last}.`;
  } else types.length === 2 ? msg += `one of type ${types[0]} or ${types[1]}.` : msg += `of type ${types[0]}.`;
  return actual == null ? msg += ` Received ${actual}` : typeof actual == "function" && actual.name ? msg += ` Received function ${actual.name}` : typeof actual == "object" && actual != null && actual.constructor?.name && (msg += ` Received an instance of ${actual.constructor.name}`), msg;
}
function invalidKeyType(alg, actual, secret) {
  const types = ["CryptoKey", "KeyObject", "JSON Web Key"];
  return secret && types.push("Uint8Array"), new TypeError(message(`Key for the ${alg} algorithm must be `, actual, ...types));
}
var unusable = (name, prop = "algorithm.name") => new TypeError(`CryptoKey does not support this operation, its ${prop} must be ${name}`);
function checkUsage(key, usage) {
  if (usage && !key.usages.includes(usage))
    throw new TypeError(`CryptoKey does not support this operation, its usages must include ${usage}.`);
}
function checkModulusLength(alg, key) {
  const { modulusLength } = key.algorithm;
  if (typeof modulusLength != "number" || modulusLength < 2048)
    throw new TypeError(`${alg} requires key modulusLength to be 2048 bits or larger`);
}
function checkCryptoKey(key, expected, usage) {
  const algorithm = key.algorithm;
  if (algorithm.name !== expected.name)
    throw unusable(expected.name);
  if (expected.hash && algorithm.hash?.name !== expected.hash)
    throw unusable(expected.hash, "algorithm.hash");
  if (expected.namedCurve && algorithm.namedCurve !== expected.namedCurve)
    throw unusable(expected.namedCurve, "algorithm.namedCurve");
  if (expected.length !== void 0 && algorithm.length !== expected.length)
    throw unusable(expected.length, "algorithm.length");
  checkUsage(key, usage);
}
function snapshotJwk(jwk) {
  return { __proto__: null, ...jwk };
}
function normalizeJwk(jwk) {
  const normalized = snapshotJwk(jwk);
  if (normalized.ext !== void 0 && typeof normalized.ext != "boolean")
    throw new TypeError('"ext" (Extractable) Parameter must be a boolean');
  if (normalized.key_ops !== void 0) {
    const value = normalized.key_ops, keyOps = Array.isArray(value) ? [...value] : void 0;
    if (!keyOps || keyOps.some((operation) => typeof operation != "string") || new Set(keyOps).size !== keyOps.length)
      throw new TypeError('"key_ops" (Key Operations) Parameter must be an array of unique strings');
    normalized.key_ops = keyOps;
  }
  return normalized;
}
async function jwkToKey(entry, jwk, extractable) {
  if (!entry.kty.includes(jwk.kty))
    throw new JOSENotSupported('Invalid or unsupported JWK "alg" (Algorithm) Parameter value');
  const algorithm = entry.resolve?.({ kty: jwk.kty, crv: jwk.crv }) ?? entry.subtle, isPrivate = !!(jwk.d || jwk.priv), keyData = { ...jwk, ext: extractable ?? jwk.ext };
  return keyData.kty !== "AKP" && delete keyData.alg, delete keyData.use, crypto.subtle.importKey("jwk", keyData, algorithm, keyData.ext ?? !isPrivate, jwk.key_ops ?? entry.usages[isPrivate ? 1 : 0]);
}
async function rawKey(key, expected, usage, extractable = false) {
  return key instanceof Uint8Array && (key = await crypto.subtle.importKey("raw", key, expected, extractable, [usage])), checkCryptoKey(key, expected, usage), key;
}

// ../../../../node_modules/.pnpm/jose@6.2.17/node_modules/jose/dist/webapi/lib/key_descriptor.js
function table(entries) {
  const out = { __proto__: null };
  for (const alg in entries)
    out[alg] = { ...entries[alg], alg };
  return out;
}

// ../../../../node_modules/.pnpm/jose@6.2.17/node_modules/jose/dist/webapi/lib/jws_algorithms.js
var sig = [["verify"], ["sign"]];
function hmac(bits) {
  const subtle = { name: "HMAC", hash: `SHA-${bits}` };
  return { kty: ["oct"], secret: true, subtle, signing: subtle, usages: sig };
}
function rsa(bits, saltLength) {
  const subtle = { name: saltLength ? "RSA-PSS" : "RSASSA-PKCS1-v1_5", hash: `SHA-${bits}` };
  return {
    kty: ["RSA"],
    subtle,
    signing: saltLength ? { ...subtle, saltLength } : subtle,
    usages: sig,
    minRsaBits: 2048
  };
}
function ecdsa(crv, bits) {
  return {
    kty: ["EC"],
    crv,
    subtle: { name: "ECDSA", namedCurve: crv },
    signing: { name: "ECDSA", hash: `SHA-${bits}` },
    usages: sig
  };
}
function eddsa() {
  const subtle = { name: "Ed25519" };
  return {
    kty: ["OKP"],
    crv: "Ed25519",
    subtle,
    signing: subtle,
    usages: sig
  };
}
function mldsa(parameterSet) {
  const subtle = { name: `ML-DSA-${parameterSet}` };
  return {
    kty: ["AKP"],
    subtle,
    signing: subtle,
    usages: sig
  };
}
var JWS = table({
  HS256: hmac(256),
  HS384: hmac(384),
  HS512: hmac(512),
  RS256: rsa(256),
  RS384: rsa(384),
  RS512: rsa(512),
  PS256: rsa(256, 32),
  PS384: rsa(384, 48),
  PS512: rsa(512, 64),
  ES256: ecdsa("P-256", 256),
  ES384: ecdsa("P-384", 384),
  ES512: ecdsa("P-521", 512),
  EdDSA: eddsa(),
  Ed25519: eddsa(),
  "ML-DSA-44": mldsa(44),
  "ML-DSA-65": mldsa(65),
  "ML-DSA-87": mldsa(87)
});
function jwsAlgorithm(alg) {
  const entry = typeof alg == "string" ? JWS[alg] : void 0;
  if (!entry)
    throw new JOSENotSupported(`alg ${alg} is not supported either by JOSE or your javascript runtime`);
  return entry;
}

// ../../../../node_modules/.pnpm/jose@6.2.17/node_modules/jose/dist/webapi/lib/jwt_claims_set.js
var epoch = (date) => Math.floor(date.getTime() / 1e3);
var multipliers = {
  s: 1,
  m: 60,
  h: 3600,
  d: 86400,
  w: 604800,
  y: 31557600
};
var REGEX = /^(\+|\-)? ?(\d+|\d+\.\d+) ?(seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)(?: (ago|from now))?$/i;
function invalidDuration() {
  throw new TypeError("Invalid time period format");
}
function secs(str) {
  typeof str != "string" && invalidDuration();
  const matched = REGEX.exec(str);
  (!matched || matched[4] && matched[1]) && invalidDuration();
  const value = parseFloat(matched[2]), durationSeconds = Math.round(value * multipliers[matched[3][0].toLowerCase()]);
  return Number.isFinite(durationSeconds) || invalidDuration(), matched[1] === "-" || matched[4] === "ago" ? -durationSeconds : durationSeconds;
}
function validateInput(label, input) {
  if (!Number.isFinite(input))
    throw new TypeError(`Invalid ${label} input`);
  return input;
}
function validateStringClaim(claim, value) {
  if (typeof value != "string")
    throw new TypeError(`"${claim}" claim must be a string`);
}
function validateAudienceClaim(value) {
  if (typeof value != "string" && (!Array.isArray(value) || Array.from(value).some((member) => typeof member != "string")))
    throw new TypeError('"aud" claim must be a string or an array of strings');
}
function numericDate(value, label) {
  return typeof value == "number" ? validateInput(label, value) : value instanceof Date ? validateInput(label, epoch(value)) : epoch(/* @__PURE__ */ new Date()) + secs(value);
}
var producerClaimsSets;
function producerClaimsSet(producer) {
  return producerClaimsSets.get(producer);
}
function jwtClaimsSetBytes(producer) {
  const claimsSet = producerClaimsSet(producer);
  for (const claim of ["iat", "nbf", "exp"]) {
    const value = claimsSet[claim];
    if (typeof value == "number" && !Number.isFinite(value))
      throw new TypeError(`"${claim}" claim must be a finite number`);
  }
  return encoder.encode(JSON.stringify(claimsSet));
}
var JWTClaimsBuilder = class {
  constructor(claimsSet = {}) {
    if (!isObject(claimsSet))
      throw new TypeError("JWT Claims Set MUST be an object");
    (producerClaimsSets ||= /* @__PURE__ */ new WeakMap()).set(this, structuredClone(claimsSet));
  }
  setIssuer(value) {
    return validateStringClaim("iss", value), producerClaimsSet(this).iss = value, this;
  }
  setSubject(value) {
    return validateStringClaim("sub", value), producerClaimsSet(this).sub = value, this;
  }
  setAudience(value) {
    return validateAudienceClaim(value), producerClaimsSet(this).aud = value, this;
  }
  setJti(value) {
    return validateStringClaim("jti", value), producerClaimsSet(this).jti = value, this;
  }
  setNotBefore(value) {
    return producerClaimsSet(this).nbf = numericDate(value, "setNotBefore"), this;
  }
  setExpirationTime(value) {
    return producerClaimsSet(this).exp = numericDate(value, "setExpirationTime"), this;
  }
  setIssuedAt(value) {
    const claimsSet = producerClaimsSet(this);
    return value === void 0 ? claimsSet.iat = epoch(/* @__PURE__ */ new Date()) : typeof value == "string" ? claimsSet.iat = validateInput("setIssuedAt", epoch(/* @__PURE__ */ new Date()) + secs(value)) : claimsSet.iat = numericDate(value, "setIssuedAt"), this;
  }
};

// ../../../../node_modules/.pnpm/jose@6.2.17/node_modules/jose/dist/webapi/lib/jws_sign.js
async function createSignature(input, key, rejectUnencoded) {
  let [payload, protectedHeader, unprotectedHeader, crit] = input, encodedProtectedHeader = "";
  if (protectedHeader !== void 0) {
    const normalized = serializeJoseHeader(JWSInvalid, protectedHeader);
    protectedHeader = normalized[0], encodedProtectedHeader = encode2(normalized[1]);
  }
  if (unprotectedHeader !== void 0 && (unprotectedHeader = serializeJoseHeader(JWSInvalid, unprotectedHeader)[0]), !protectedHeader && !unprotectedHeader)
    throw new JWSInvalid("either setProtectedHeader or setUnprotectedHeader must be called before #sign()");
  if (!isDisjoint(protectedHeader, unprotectedHeader))
    throw new JWSInvalid("JWS Protected and JWS Unprotected Header Parameter names must be disjoint");
  const joseHeader = { ...protectedHeader, ...unprotectedHeader };
  validateCritDuplicates(JWSInvalid, protectedHeader);
  const b64 = validateB64(protectedHeader, validateCrit(JWSInvalid, JWS_RECOGNIZED, crit, protectedHeader, joseHeader));
  b64 || rejectUnencoded?.();
  const { alg } = joseHeader;
  if (typeof alg != "string" || !alg)
    throw new JWSInvalid('JWS "alg" (Algorithm) Header Parameter missing or invalid');
  const entry = jwsAlgorithm(alg);
  let encodedPayload = "", signingPayload = payload, signingInput;
  if (b64) {
    const encodedPayloadCache = input[4];
    encodedPayloadCache ? (encodedPayload = encodedPayloadCache[0] ??= encode2(payload), signingPayload = encodedPayloadCache[1] ??= encode(encodedPayload)) : (encodedPayload = encode2(payload), signingInput = encoder.encode(`${encodedProtectedHeader}.${encodedPayload}`));
  }
  signingInput ??= concat(encode(encodedProtectedHeader), encode("."), signingPayload);
  const signingKey = await rawKey(await prepareKey(entry, key, "sign"), entry.subtle, "sign");
  entry.minRsaBits && checkModulusLength(entry.alg, signingKey);
  const jws = {
    signature: encode2(new Uint8Array(await crypto.subtle.sign(entry.signing, signingKey, signingInput))),
    payload: encodedPayload
  };
  return protectedHeader && (jws.protected = encodedProtectedHeader), unprotectedHeader && (jws.header = unprotectedHeader), [jws, b64];
}
async function createCompactSignature(payload, protectedHeader, crit, key, rejectUnencoded) {
  const [jws] = await createSignature([payload, protectedHeader, void 0, crit], key, rejectUnencoded);
  return `${jws.protected}.${jws.payload}.${jws.signature}`;
}

// ../../../../node_modules/.pnpm/jose@6.2.17/node_modules/jose/dist/webapi/jwt/sign.js
var SignJWT_base = JWTClaimsBuilder;
var SignJWT = class extends SignJWT_base {
  #protectedHeader;
  setProtectedHeader(protectedHeader) {
    return assertNotSet(this.#protectedHeader, "setProtectedHeader"), this.#protectedHeader = protectedHeader, this;
  }
  async sign(key, options) {
    return createCompactSignature(jwtClaimsSetBytes(this), this.#protectedHeader, options?.crit, key, () => {
      throw new JWTInvalid("JWTs MUST NOT use unencoded payload");
    });
  }
};

// ../../../../packages/core/src/ghost/admin-key.ts
var ADMIN_KEY = /^([0-9a-f]{24}):([0-9a-f]{64})$/i;
var MalformedAdminKeyError = class extends Error {
  constructor() {
    super("The Ghost Admin API key is not in Ghost's id:secret form. Copy it again from Ghost Admin, Settings, Integrations.");
    this.name = "MalformedAdminKeyError";
  }
};
function parseAdminKey(key) {
  const match = ADMIN_KEY.exec(key.trim());
  if (!match) {
    throw new MalformedAdminKeyError();
  }
  return {
    id: match[1],
    secret: hexToBytes(match[2])
  };
}
function hexToBytes(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let index = 0; index < bytes.length; index++) {
    const pair = hex.slice(index * 2, index * 2 + 2);
    bytes[index] = parseInt(pair, 16);
  }
  return bytes;
}

// ../../../../packages/core/src/ghost/token.ts
async function adminToken(key, now = /* @__PURE__ */ new Date()) {
  const { id, secret } = parseAdminKey(key);
  const issuedAt = Math.floor(now.getTime() / 1e3);
  const fiveMinutesInSeconds = 5 * 60;
  const token = new SignJWT({}).setProtectedHeader({ alg: "HS256", typ: "JWT", kid: id }).setIssuedAt(issuedAt).setExpirationTime(issuedAt + fiveMinutesInSeconds).setAudience("/admin/");
  return token.sign(secret);
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
var EXIT_REFUSED_OR_FAILED = 2;

// ../../../../packages/core/src/time/now-in.ts
function nowIn(timeZone, now = /* @__PURE__ */ new Date()) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
      timeZoneName: "longOffset"
    }).formatToParts(now).map((part) => [part.type, part.value])
  );
  const today = `${parts.year}-${parts.month}-${parts.day}`;
  const offset = String(parts.timeZoneName).replace("GMT", "") || "+00:00";
  return { today, stamp: `${today}T${parts.hour}:${parts.minute}${offset}` };
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

// ../../../../packages/core/src/node/read-key.ts
import { readFile } from "node:fs/promises";
async function readKey(keysFilePath, keyName) {
  const text = await readFile(expandHome(keysFilePath), "utf8");
  const keys = parseKeysFile(text);
  return findKey(keys, keyName);
}

// ../../../../packages/core/src/node/print-output.ts
function printOutput(result, mode) {
  const output = formatOutput(result, mode);
  process.stdout.write(`${output}
`);
}

// ../../../../packages/core/src/node/text-file.ts
import { readFile as readFile2, writeFile } from "node:fs/promises";
async function readText(path) {
  try {
    return await readFile2(expandHome(path), "utf8");
  } catch {
    return void 0;
  }
}

// ../../../../packages/ledger/src/dates.ts
var DAY_MS = 864e5;
function addDays(d, n) {
  const ms = Date.parse(`${d}T00:00:00Z`) + n * DAY_MS;
  return new Date(ms).toISOString().slice(0, 10);
}
function mondayOf(d) {
  const day = (/* @__PURE__ */ new Date(`${d}T00:00:00Z`)).getUTCDay();
  const daysSinceMonday = (day + 6) % 7;
  return addDays(d, -daysSinceMonday);
}

// ../../../../packages/ledger/src/read/not-read-yet.ts
var GRAPH_WORDS = [
  { word: "needs", starts: /^group\s[^:]*\sneeds:/ },
  { word: "moving between groups", starts: /^\[[^\]]+\].*(\u2192|->)/ },
  { word: "rule", starts: /^rule\s/ },
  { word: "limit", starts: /^limit\s/ },
  { word: "campaign", starts: /^campaign\s/ }
];
var PLAN_WORDS = [
  { word: "want for a group", starts: /^want\s.*\[[^\]]+\]/ },
  { word: "ask", starts: /^ask\s/ },
  { word: "every day", starts: /^every day\b/ },
  { word: "series", starts: /^\d{4}-\d{2}-\d{2}\s[^:]+:\s*\S/ }
];
var DONE_WORDS = [];
var WORDS = {
  graph: GRAPH_WORDS,
  plan: PLAN_WORDS,
  done: DONE_WORDS,
  summary: []
};
function notReadYetWord(part, text) {
  const trimmed = text.trim();
  for (const specWord of WORDS[part]) {
    if (specWord.starts.test(trimmed)) {
      return specWord.word;
    }
  }
  return void 0;
}

// ../../../../packages/ledger/src/read/read-done.ts
var DATE = "(\\d{4}-\\d{2}-\\d{2})";
var NUMBER = "(\\d+(?:,\\d{3})*(?:\\.\\d+)?)";
var STARTED = new RegExp(`^started ${DATE}$`);
var SAID = new RegExp(`^${DATE} said (.+?) on ${DATE}: "(.*)" (\\S+) \\[(.*)\\](?: topic: (.+?))? summary: "(.*)"$`);
var COUNTED_TO = new RegExp(`^${DATE} counted to ${DATE}$`);
var ANSWER = new RegExp(`^${DATE} (.+): (done|not done)(?: at (\\S+ \\S+))?$`);
var READ = new RegExp(`^${DATE} read on ${DATE}$`);
var CHANGE = new RegExp(`^${DATE} ((?:new|was|gone) .+)$`);
var FACT_TOTAL = new RegExp(`^${DATE} fact total (.+): ${NUMBER}$`);
var FACT_COUNT = new RegExp(`^${DATE} fact count (.+): ${NUMBER}$`);
function readDone(lines) {
  const done = { weeks: {}, facts: [], others: [] };
  const unread = [];
  for (const numbered of lines) {
    const text = numbered.text.trim();
    if (text === "") {
      continue;
    }
    const understood = addToDone(done, text, numbered.line);
    if (!understood) {
      done.others.push(text);
      unread.push(numbered);
    }
  }
  return { done, unread };
}
function addToDone(done, text, line) {
  const started = STARTED.exec(text);
  if (started) {
    done.started = started[1];
    return true;
  }
  const said = SAID.exec(text);
  if (said) {
    addSaid(weekIn(done, said[1]), said);
    return true;
  }
  const read = READ.exec(text);
  if (read) {
    weekIn(done, read[1]).readOn = read[2];
    return true;
  }
  const countedTo = COUNTED_TO.exec(text);
  if (countedTo) {
    weekIn(done, countedTo[1]).countedTo = countedTo[2];
    return true;
  }
  const answer = ANSWER.exec(text);
  if (answer) {
    addAnswer(weekIn(done, answer[1]), answer);
    return true;
  }
  const change = CHANGE.exec(text);
  if (change) {
    const week = weekIn(done, change[1]);
    week.changes = [...week.changes ?? [], change[2]];
    return true;
  }
  const total = FACT_TOTAL.exec(text);
  if (total) {
    addFact(done, "total", total, line);
    return true;
  }
  const count = FACT_COUNT.exec(text);
  if (count) {
    addFact(done, "count", count, line);
    return true;
  }
  return false;
}
function addAnswer(week, match) {
  const step = match[2];
  week.answers[step] = match[3];
  if (match[4]) {
    week.when = { ...week.when ?? {}, [step]: match[4] };
  }
}
function addFact(done, kind, match, line) {
  const date = match[1];
  const fact = match[2];
  const n = Number(match[3].replace(/,/g, ""));
  const week = weekIn(done, date);
  if (kind === "total") {
    week.totals[fact] = n;
  } else {
    week.counts = { ...week.counts ?? {}, [fact]: n };
  }
  done.facts.push({ kind, date, fact, n, line });
}
function addSaid(week, match) {
  const said = {
    how: match[2],
    on: match[3],
    title: match[4],
    url: match[5],
    for: match[6].split(", ").filter(Boolean),
    ...match[7] ? { topic: match[7] } : {},
    summary: match[8]
  };
  const others = (week.said ?? []).filter((earlier) => !(earlier.url === said.url && earlier.how === said.how));
  week.said = [...others, said];
}
function weekIn(done, date) {
  if (!done.weeks[date]) {
    done.weeks[date] = { answers: {}, totals: {} };
  }
  return done.weeks[date];
}

// ../../../../packages/ledger/src/read/lines.js
var peg$SyntaxError = class extends SyntaxError {
  constructor(message2, expected, found, location) {
    super(message2);
    this.expected = expected;
    this.found = found;
    this.location = location;
    this.name = "SyntaxError";
  }
  format(sources) {
    let str = "Error: " + this.message;
    if (this.location) {
      let src = null;
      const st = sources.find((s2) => s2.source === this.location.source);
      if (st) {
        src = st.text.split(/\r\n|\n|\r/g);
      }
      const s = this.location.start;
      const offset_s = this.location.source && typeof this.location.source.offset === "function" ? this.location.source.offset(s) : s;
      const loc = this.location.source + ":" + offset_s.line + ":" + offset_s.column;
      if (src) {
        const e = this.location.end;
        const filler = "".padEnd(offset_s.line.toString().length, " ");
        const line = src[s.line - 1];
        const last = s.line === e.line ? e.column : line.length + 1;
        const hatLen = last - s.column || 1;
        str += "\n --> " + loc + "\n" + filler + " |\n" + offset_s.line + " | " + line + "\n" + filler + " | " + "".padEnd(s.column - 1, " ") + "".padEnd(hatLen, "^");
      } else {
        str += "\n at " + loc;
      }
    }
    return str;
  }
  static buildMessage(expected, found) {
    function hex(ch) {
      return ch.codePointAt(0).toString(16).toUpperCase();
    }
    const nonPrintable = Object.prototype.hasOwnProperty.call(RegExp.prototype, "unicode") ? new RegExp("[\\p{C}\\p{Mn}\\p{Mc}]", "gu") : null;
    function unicodeEscape(s) {
      if (nonPrintable) {
        return s.replace(nonPrintable, (ch) => "\\u{" + hex(ch) + "}");
      }
      return s;
    }
    function escape(s, special) {
      return unicodeEscape(s.replace(special, "\\$&").replace(/\0/g, "\\0").replace(/\t/g, "\\t").replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/[\x00-\x0F]/g, (ch) => "\\x0" + hex(ch)).replace(/[\x10-\x1F\x7F-\x9F]/g, (ch) => "\\x" + hex(ch)));
    }
    function literalEscape(s) {
      return escape(s, /[\\"]/g);
    }
    function classEscape(s) {
      return escape(s, /[\\\]^-]/g);
    }
    const DESCRIBE_EXPECTATION_FNS = {
      literal(expectation) {
        return '"' + literalEscape(expectation.text) + '"';
      },
      class(expectation) {
        const escapedParts = expectation.parts.map(
          (part) => Array.isArray(part) ? classEscape(part[0]) + "-" + classEscape(part[1]) : classEscape(part)
        );
        return "[" + (expectation.inverted ? "^" : "") + escapedParts.join("") + "]" + (expectation.unicode ? "u" : "");
      },
      any() {
        return "any character";
      },
      end() {
        return "end of input";
      },
      other(expectation) {
        return expectation.description;
      }
    };
    function describeExpectation(expectation) {
      return DESCRIBE_EXPECTATION_FNS[expectation.type](expectation);
    }
    function describeExpected(expected2) {
      const descriptions = expected2.map(describeExpectation);
      descriptions.sort();
      if (descriptions.length > 0) {
        let j = 1;
        for (let i = 1; i < descriptions.length; i++) {
          if (descriptions[i - 1] !== descriptions[i]) {
            descriptions[j] = descriptions[i];
            j++;
          }
        }
        descriptions.length = j;
      }
      switch (descriptions.length) {
        case 1:
          return descriptions[0];
        case 2:
          return descriptions[0] + " or " + descriptions[1];
        default:
          return descriptions.slice(0, -1).join(", ") + ", or " + descriptions[descriptions.length - 1];
      }
    }
    function describeFound(found2) {
      return found2 ? '"' + literalEscape(found2) + '"' : "end of input";
    }
    return "Expected " + describeExpected(expected) + " but " + describeFound(found) + " found.";
  }
};
function peg$parse(input, options) {
  options = options !== void 0 ? options : {};
  const peg$FAILED = {};
  const peg$source = options.grammarSource;
  const peg$startRuleFunctions = {
    GraphLine: peg$parseGraphLine,
    PlanLine: peg$parsePlanLine
  };
  let peg$startRuleFunction = peg$parseGraphLine;
  const peg$c0 = "extends";
  const peg$c1 = "fact";
  const peg$c2 = ":";
  const peg$c3 = "group";
  const peg$c4 = "area";
  const peg$c5 = ",";
  const peg$c6 = "icon";
  const peg$c7 = "cycle";
  const peg$c8 = "daily";
  const peg$c9 = "weekly";
  const peg$c10 = "monthly";
  const peg$c11 = "quarterly";
  const peg$c12 = "yearly";
  const peg$c13 = "removes";
  const peg$c14 = "remove";
  const peg$c15 = "when";
  const peg$c16 = "+";
  const peg$c17 = "[";
  const peg$c18 = "]";
  const peg$c19 = "?";
  const peg$c20 = "from";
  const peg$c21 = "people";
  const peg$c22 = "like";
  const peg$c23 = "to";
  const peg$c24 = "of";
  const peg$c25 = "within";
  const peg$c26 = "same week";
  const peg$c27 = "weeks";
  const peg$c28 = "week";
  const peg$c29 = "days";
  const peg$c30 = "day";
  const peg$c31 = "months";
  const peg$c32 = "month";
  const peg$c33 = "years";
  const peg$c34 = "year";
  const peg$c35 = "(";
  const peg$c36 = "proven";
  const peg$c37 = "believed";
  const peg$c38 = "assumed";
  const peg$c39 = "unknown";
  const peg$c40 = "downside";
  const peg$c41 = ")";
  const peg$c42 = "start";
  const peg$c43 = "want";
  const peg$c44 = "a";
  const peg$c45 = "per";
  const peg$c46 = "each";
  const peg$c47 = "by";
  const peg$c48 = "every";
  const peg$c49 = "how";
  const peg$c50 = "script";
  const peg$c51 = "tag";
  const peg$c52 = "status";
  const peg$c53 = "paid";
  const peg$c54 = "free";
  const peg$c55 = "comped";
  const peg$c56 = "has";
  const peg$c57 = "opened";
  const peg$c58 = "of the last";
  const peg$c59 = "field";
  const peg$c60 = "answered";
  const peg$c61 = "is";
  const peg$c62 = "joined from";
  const peg$c63 = "email ends with";
  const peg$c64 = "-";
  const peg$c65 = "spec";
  const peg$c66 = ".";
  const peg$c67 = "→";
  const peg$c68 = "->";
  const peg$c69 = "#";
  const peg$e0 = peg$literalExpectation("extends", false);
  const peg$e1 = peg$literalExpectation("fact", false);
  const peg$e2 = peg$literalExpectation(":", false);
  const peg$e3 = peg$literalExpectation("group", false);
  const peg$e4 = peg$classExpectation([":", "\n"], true, false, false);
  const peg$e5 = peg$literalExpectation("area", false);
  const peg$e6 = peg$literalExpectation(",", false);
  const peg$e7 = peg$literalExpectation("icon", false);
  const peg$e8 = peg$literalExpectation("cycle", false);
  const peg$e9 = peg$literalExpectation("daily", false);
  const peg$e10 = peg$literalExpectation("weekly", false);
  const peg$e11 = peg$literalExpectation("monthly", false);
  const peg$e12 = peg$literalExpectation("quarterly", false);
  const peg$e13 = peg$literalExpectation("yearly", false);
  const peg$e14 = peg$anyExpectation();
  const peg$e15 = peg$literalExpectation("removes", false);
  const peg$e16 = peg$literalExpectation("remove", false);
  const peg$e17 = peg$literalExpectation("when", false);
  const peg$e18 = peg$classExpectation(["\n"], true, false, false);
  const peg$e19 = peg$literalExpectation("+", false);
  const peg$e20 = peg$literalExpectation("[", false);
  const peg$e21 = peg$classExpectation(["]", "\n"], true, false, false);
  const peg$e22 = peg$literalExpectation("]", false);
  const peg$e23 = peg$literalExpectation("?", false);
  const peg$e24 = peg$literalExpectation("from", false);
  const peg$e25 = peg$literalExpectation("people", false);
  const peg$e26 = peg$literalExpectation("like", false);
  const peg$e27 = peg$literalExpectation("to", false);
  const peg$e28 = peg$literalExpectation("of", false);
  const peg$e29 = peg$classExpectation([" ", "	"], false, false, false);
  const peg$e30 = peg$classExpectation([",", "(", "\n", "#"], true, false, false);
  const peg$e31 = peg$literalExpectation("within", false);
  const peg$e32 = peg$literalExpectation("same week", false);
  const peg$e33 = peg$literalExpectation("weeks", false);
  const peg$e34 = peg$literalExpectation("week", false);
  const peg$e35 = peg$literalExpectation("days", false);
  const peg$e36 = peg$literalExpectation("day", false);
  const peg$e37 = peg$literalExpectation("months", false);
  const peg$e38 = peg$literalExpectation("month", false);
  const peg$e39 = peg$literalExpectation("years", false);
  const peg$e40 = peg$literalExpectation("year", false);
  const peg$e41 = peg$literalExpectation("(", false);
  const peg$e42 = peg$literalExpectation("proven", false);
  const peg$e43 = peg$literalExpectation("believed", false);
  const peg$e44 = peg$literalExpectation("assumed", false);
  const peg$e45 = peg$literalExpectation("unknown", false);
  const peg$e46 = peg$literalExpectation("downside", false);
  const peg$e47 = peg$literalExpectation(")", false);
  const peg$e48 = peg$literalExpectation("start", false);
  const peg$e49 = peg$literalExpectation("want", false);
  const peg$e50 = peg$literalExpectation("a", false);
  const peg$e51 = peg$literalExpectation("per", false);
  const peg$e52 = peg$literalExpectation("each", false);
  const peg$e53 = peg$literalExpectation("by", false);
  const peg$e54 = peg$literalExpectation("every", false);
  const peg$e55 = peg$literalExpectation("how", false);
  const peg$e56 = peg$literalExpectation("script", false);
  const peg$e57 = peg$classExpectation(["+", "-", "−"], false, false, false);
  const peg$e58 = peg$classExpectation(["→", ":", "[", "]", "+", "(", ")", ",", "#", "\n"], true, false, false);
  const peg$e59 = peg$literalExpectation("tag", false);
  const peg$e60 = peg$classExpectation([" ", "	", "\n", "#"], true, false, false);
  const peg$e61 = peg$literalExpectation("status", false);
  const peg$e62 = peg$literalExpectation("paid", false);
  const peg$e63 = peg$literalExpectation("free", false);
  const peg$e64 = peg$literalExpectation("comped", false);
  const peg$e65 = peg$literalExpectation("has", false);
  const peg$e66 = peg$literalExpectation("opened", false);
  const peg$e67 = peg$literalExpectation("of the last", false);
  const peg$e68 = peg$literalExpectation("field", false);
  const peg$e69 = peg$literalExpectation("answered", false);
  const peg$e70 = peg$literalExpectation("is", false);
  const peg$e71 = peg$classExpectation(["#", "\n"], true, false, false);
  const peg$e72 = peg$literalExpectation("joined from", false);
  const peg$e73 = peg$literalExpectation("email ends with", false);
  const peg$e74 = peg$classExpectation([["0", "9"]], false, false, false);
  const peg$e75 = peg$literalExpectation("-", false);
  const peg$e76 = peg$literalExpectation("spec", false);
  const peg$e77 = peg$literalExpectation(".", false);
  const peg$e78 = peg$literalExpectation("→", false);
  const peg$e79 = peg$literalExpectation("->", false);
  const peg$e80 = peg$literalExpectation("#", false);
  function peg$f0(file) {
    return { kind: "extends", file };
  }
  function peg$f1(fact, source) {
    return { kind: "fact", fact, source };
  }
  function peg$f2(name, rule) {
    return { kind: "group", name: name.trim(), rule };
  }
  function peg$f3(name, first, n) {
    return n;
  }
  function peg$f4(name, first, rest) {
    return { kind: "area", name: name.trim(), members: [first, ...rest] };
  }
  function peg$f5(icon, first, n) {
    return n;
  }
  function peg$f6(icon, first, rest) {
    return { kind: "icon", icon: icon.trim(), members: [first, ...rest] };
  }
  function peg$f7(frequency) {
    return { kind: "cycle", frequency };
  }
  function peg$f8(from, to) {
    return { kind: "remove", from, to };
  }
  function peg$f9(when, event) {
    return { kind: "when", when: when.trim(), event };
  }
  function peg$f10(from, to, result, within, label) {
    return { kind: "link", from, to, result, within: within ?? 0, label: label?.label, downside: label?.downside ?? false };
  }
  function peg$f11(first, p) {
    return p;
  }
  function peg$f12(first, rest) {
    return [first, ...rest];
  }
  function peg$f13(name, g) {
    return g.trim();
  }
  function peg$f14(name, group) {
    return group ? { name, group } : { name };
  }
  function peg$f15() {
    return { kind: "unknown" };
  }
  function peg$f16() {
    return { kind: "people" };
  }
  function peg$f17(name) {
    return { kind: "like", name };
  }
  function peg$f18(each, out, unit) {
    const m = /^(.*?)\s*over (\d+) weeks?$/.exec((unit ?? "").trim());
    const low = each.reduce((a, b) => a + b, 0);
    return { kind: "from", low, high: low, out, each, unit: (m ? m[1] : unit ?? "").trim(), weeks: m ? Number(m[2]) : 0 };
  }
  function peg$f19(low, n) {
    return n;
  }
  function peg$f20(low, high, per, out, unit) {
    const m = /^(.*?)\s*over (\d+) weeks?$/.exec((unit ?? "").trim());
    return { kind: per, low, high: high ?? low, out, unit: (m ? m[1] : unit ?? "").trim(), weeks: m ? Number(m[2]) : 0 };
  }
  function peg$f21(first, n) {
    return n;
  }
  function peg$f22(first, rest) {
    return [first, ...rest];
  }
  function peg$f23(u) {
    return u;
  }
  function peg$f24() {
    return "?";
  }
  function peg$f25() {
    return 0;
  }
  function peg$f26(n, u) {
    const days = { week: 7, day: 1, month: 30, year: 365 }[u.replace(/s$/, "")];
    return Math.max(1, Math.ceil(n * days / 7));
  }
  function peg$f27(w) {
    return w;
  }
  function peg$f28(label, downside) {
    return { label, downside: !!downside };
  }
  function peg$f29(file) {
    return { kind: "extends", file };
  }
  function peg$f30(date) {
    return { kind: "start", date };
  }
  function peg$f31(fact, plus, n, every, d) {
    return d;
  }
  function peg$f32(fact, plus, n, every, by) {
    return { kind: "want", fact, per: { n, every }, by: by ?? void 0, grows: plus ? true : void 0 };
  }
  function peg$f33(fact, n) {
    return n;
  }
  function peg$f34(fact, n, d) {
    return d;
  }
  function peg$f35(fact, n, by) {
    return { kind: "want", fact, n: n ?? void 0, by: by ?? void 0 };
  }
  function peg$f36(first, p) {
    return p;
  }
  function peg$f37(first, rest, d) {
    return d;
  }
  function peg$f38(first, rest, from) {
    return { kind: "every", every: "week", methods: [first, ...rest], from: from ?? void 0 };
  }
  function peg$f39(thing, words) {
    return { kind: "how", thing: thing.trim(), words: words.trim() };
  }
  function peg$f40(week, kind, thing, words) {
    return { kind, thing: thing.trim(), words: words.trim(), week };
  }
  function peg$f41(thing, words) {
    return { kind: "script", thing: thing.trim(), words: words.trim() };
  }
  function peg$f42(date, o) {
    return o === "+" ? "+" : "-";
  }
  function peg$f43(date, op, first, p) {
    return p;
  }
  function peg$f44(date, op, first, rest) {
    return { kind: "entry", date, op: op ?? "=", methods: [first, ...rest] };
  }
  function peg$f45(n, g) {
    return g.trim();
  }
  function peg$f46(n, group) {
    return group ? { name: n.trim(), group } : { name: n.trim() };
  }
  function peg$f47(tag2) {
    return { kind: "tag", tag: tag2 };
  }
  function peg$f48(status) {
    return { kind: "status", status };
  }
  function peg$f49(field) {
    return { kind: "has", field };
  }
  function peg$f50(k, n) {
    return { kind: "opened", k, n };
  }
  function peg$f51(field) {
    return { kind: "answered", field };
  }
  function peg$f52(field, value) {
    return { kind: "field", field, value: value.trim() };
  }
  function peg$f53(source) {
    return { kind: "joined", source: source.trim() };
  }
  function peg$f54(ends) {
    return { kind: "email", ends: ends.toLowerCase() };
  }
  function peg$f55(n) {
    return n.trim();
  }
  function peg$f56(version) {
    return { kind: "spec", version };
  }
  function peg$f57() {
    return { kind: "blank" };
  }
  function peg$f58(n) {
    return n.trim();
  }
  function peg$f59(n) {
    return Number(n.replace(/,/g, ""));
  }
  function peg$f60(r) {
    return r.trim();
  }
  let peg$currPos = options.peg$currPos | 0;
  let peg$savedPos = peg$currPos;
  const peg$posDetailsCache = [{ line: 1, column: 1 }];
  let peg$maxFailPos = peg$currPos;
  let peg$maxFailExpected = options.peg$maxFailExpected || [];
  let peg$silentFails = options.peg$silentFails | 0;
  let peg$result;
  let peg$charCode;
  if (options.startRule) {
    if (!(options.startRule in peg$startRuleFunctions)) {
      throw new Error(`Can't start parsing from rule "` + options.startRule + '".');
    }
    peg$startRuleFunction = peg$startRuleFunctions[options.startRule];
  }
  function text() {
    return input.substring(peg$savedPos, peg$currPos);
  }
  function offset() {
    return peg$savedPos;
  }
  function range() {
    return {
      source: peg$source,
      start: peg$savedPos,
      end: peg$currPos
    };
  }
  function location() {
    return peg$computeLocation(peg$savedPos, peg$currPos);
  }
  function expected(description, location2) {
    location2 = location2 !== void 0 ? location2 : peg$computeLocation(peg$savedPos, peg$currPos);
    throw peg$buildStructuredError(
      [peg$otherExpectation(description)],
      input.substring(peg$savedPos, peg$currPos),
      location2
    );
  }
  function error(message2, location2) {
    location2 = location2 !== void 0 ? location2 : peg$computeLocation(peg$savedPos, peg$currPos);
    throw peg$buildSimpleError(message2, location2);
  }
  function peg$getUnicode(pos = peg$currPos) {
    const cp = input.codePointAt(pos);
    if (cp === void 0) {
      return "";
    }
    return String.fromCodePoint(cp);
  }
  function peg$literalExpectation(text2, ignoreCase) {
    return { type: "literal", text: text2, ignoreCase };
  }
  function peg$classExpectation(parts, inverted, ignoreCase, unicode) {
    return { type: "class", parts, inverted, ignoreCase, unicode };
  }
  function peg$anyExpectation() {
    return { type: "any" };
  }
  function peg$endExpectation() {
    return { type: "end" };
  }
  function peg$otherExpectation(description) {
    return { type: "other", description };
  }
  function peg$computePosDetails(pos) {
    let details = peg$posDetailsCache[pos];
    let p;
    if (details) {
      return details;
    } else {
      if (pos >= peg$posDetailsCache.length) {
        p = peg$posDetailsCache.length - 1;
      } else {
        p = pos;
        while (!peg$posDetailsCache[--p]) {
        }
      }
      details = peg$posDetailsCache[p];
      details = {
        line: details.line,
        column: details.column
      };
      while (p < pos) {
        if (input.charCodeAt(p) === 10) {
          details.line++;
          details.column = 1;
        } else {
          details.column++;
        }
        p++;
      }
      peg$posDetailsCache[pos] = details;
      return details;
    }
  }
  function peg$computeLocation(startPos, endPos, offset2) {
    const startPosDetails = peg$computePosDetails(startPos);
    const endPosDetails = peg$computePosDetails(endPos);
    const res = {
      source: peg$source,
      start: {
        offset: startPos,
        line: startPosDetails.line,
        column: startPosDetails.column
      },
      end: {
        offset: endPos,
        line: endPosDetails.line,
        column: endPosDetails.column
      }
    };
    if (offset2 && peg$source && typeof peg$source.offset === "function") {
      res.start = peg$source.offset(res.start);
      res.end = peg$source.offset(res.end);
    }
    return res;
  }
  function peg$fail(expected2) {
    if (peg$currPos < peg$maxFailPos) {
      return;
    }
    if (peg$currPos > peg$maxFailPos) {
      peg$maxFailPos = peg$currPos;
      peg$maxFailExpected = [];
    }
    peg$maxFailExpected.push(expected2);
  }
  function peg$buildSimpleError(message2, location2) {
    return new peg$SyntaxError(message2, null, null, location2);
  }
  function peg$buildStructuredError(expected2, found, location2) {
    return new peg$SyntaxError(
      peg$SyntaxError.buildMessage(expected2, found),
      expected2,
      found,
      location2
    );
  }
  function peg$parseGraphLine() {
    let s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12, s13, s14, s15;
    s0 = peg$parseSpec();
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      s1 = peg$parse_();
      if (input.substr(peg$currPos, 7) === peg$c0) {
        s2 = peg$c0;
        peg$currPos += 7;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e0);
        }
      }
      if (s2 !== peg$FAILED) {
        s3 = peg$parse__();
        if (s3 !== peg$FAILED) {
          s4 = peg$parseRest();
          if (s4 !== peg$FAILED) {
            peg$savedPos = s0;
            s0 = peg$f0(s4);
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$parse_();
        if (input.substr(peg$currPos, 4) === peg$c1) {
          s2 = peg$c1;
          peg$currPos += 4;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e1);
          }
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parse__();
          if (s3 !== peg$FAILED) {
            s4 = peg$parseName();
            if (s4 !== peg$FAILED) {
              s5 = peg$parse_();
              if (input.charCodeAt(peg$currPos) === 58) {
                s6 = peg$c2;
                peg$currPos++;
              } else {
                s6 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$e2);
                }
              }
              if (s6 !== peg$FAILED) {
                s7 = peg$parse_();
                s8 = peg$parseRest();
                if (s8 !== peg$FAILED) {
                  peg$savedPos = s0;
                  s0 = peg$f1(s4, s8);
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          s1 = peg$parse_();
          if (input.substr(peg$currPos, 5) === peg$c3) {
            s2 = peg$c3;
            peg$currPos += 5;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e3);
            }
          }
          if (s2 !== peg$FAILED) {
            s3 = peg$parse__();
            if (s3 !== peg$FAILED) {
              s4 = peg$currPos;
              s5 = [];
              for (; ; ) {
                s6 = input.charAt(peg$currPos);
                if (s6 !== "" && !(peg$charCode = s6.charCodeAt(0), peg$charCode === 58 || peg$charCode === 10)) {
                  peg$currPos++;
                } else {
                  s6 = peg$FAILED;
                  if (peg$silentFails === 0) {
                    peg$fail(peg$e4);
                  }
                }
                if (s6 === peg$FAILED) {
                  break;
                }
                s5.push(s6);
              }
              if (s5.length < 1) {
                s5 = peg$FAILED;
              }
              if (s5 !== peg$FAILED) {
                s4 = input.substring(s4, peg$currPos);
              } else {
                s4 = s5;
              }
              if (s4 !== peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 58) {
                  s5 = peg$c2;
                  peg$currPos++;
                } else {
                  s5 = peg$FAILED;
                  if (peg$silentFails === 0) {
                    peg$fail(peg$e2);
                  }
                }
                if (s5 !== peg$FAILED) {
                  s6 = peg$parse_();
                  s7 = peg$parseGroupRule();
                  if (s7 !== peg$FAILED) {
                    s8 = peg$parse_();
                    s9 = peg$parseComment();
                    if (s9 === peg$FAILED) {
                      s9 = null;
                    }
                    peg$savedPos = s0;
                    s0 = peg$f2(s4, s7);
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
          if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            s1 = peg$parse_();
            if (input.substr(peg$currPos, 4) === peg$c4) {
              s2 = peg$c4;
              peg$currPos += 4;
            } else {
              s2 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$e5);
              }
            }
            if (s2 !== peg$FAILED) {
              s3 = peg$parse__();
              if (s3 !== peg$FAILED) {
                s4 = peg$currPos;
                s5 = [];
                for (; ; ) {
                  s6 = input.charAt(peg$currPos);
                  if (s6 !== "" && !(peg$charCode = s6.charCodeAt(0), peg$charCode === 58 || peg$charCode === 10)) {
                    peg$currPos++;
                  } else {
                    s6 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e4);
                    }
                  }
                  if (s6 === peg$FAILED) {
                    break;
                  }
                  s5.push(s6);
                }
                if (s5.length < 1) {
                  s5 = peg$FAILED;
                }
                if (s5 !== peg$FAILED) {
                  s4 = input.substring(s4, peg$currPos);
                } else {
                  s4 = s5;
                }
                if (s4 !== peg$FAILED) {
                  if (input.charCodeAt(peg$currPos) === 58) {
                    s5 = peg$c2;
                    peg$currPos++;
                  } else {
                    s5 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e2);
                    }
                  }
                  if (s5 !== peg$FAILED) {
                    s6 = peg$parse_();
                    s7 = peg$parseName();
                    if (s7 !== peg$FAILED) {
                      s8 = [];
                      for (; ; ) {
                        s9 = peg$currPos;
                        s10 = peg$parse_();
                        if (input.charCodeAt(peg$currPos) === 44) {
                          s11 = peg$c5;
                          peg$currPos++;
                        } else {
                          s11 = peg$FAILED;
                          if (peg$silentFails === 0) {
                            peg$fail(peg$e6);
                          }
                        }
                        if (s11 !== peg$FAILED) {
                          s12 = peg$parse_();
                          s13 = peg$parseName();
                          if (s13 !== peg$FAILED) {
                            peg$savedPos = s9;
                            s9 = peg$f3(s4, s7, s13);
                          } else {
                            peg$currPos = s9;
                            s9 = peg$FAILED;
                          }
                        } else {
                          peg$currPos = s9;
                          s9 = peg$FAILED;
                        }
                        if (s9 === peg$FAILED) {
                          break;
                        }
                        s8.push(s9);
                      }
                      s9 = peg$parse_();
                      s10 = peg$parseComment();
                      if (s10 === peg$FAILED) {
                        s10 = null;
                      }
                      peg$savedPos = s0;
                      s0 = peg$f4(s4, s7, s8);
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
            if (s0 === peg$FAILED) {
              s0 = peg$currPos;
              s1 = peg$parse_();
              if (input.substr(peg$currPos, 4) === peg$c6) {
                s2 = peg$c6;
                peg$currPos += 4;
              } else {
                s2 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$e7);
                }
              }
              if (s2 !== peg$FAILED) {
                s3 = peg$parse__();
                if (s3 !== peg$FAILED) {
                  s4 = peg$currPos;
                  s5 = [];
                  for (; ; ) {
                    s6 = input.charAt(peg$currPos);
                    if (s6 !== "" && !(peg$charCode = s6.charCodeAt(0), peg$charCode === 58 || peg$charCode === 10)) {
                      peg$currPos++;
                    } else {
                      s6 = peg$FAILED;
                      if (peg$silentFails === 0) {
                        peg$fail(peg$e4);
                      }
                    }
                    if (s6 === peg$FAILED) {
                      break;
                    }
                    s5.push(s6);
                  }
                  if (s5.length < 1) {
                    s5 = peg$FAILED;
                  }
                  if (s5 !== peg$FAILED) {
                    s4 = input.substring(s4, peg$currPos);
                  } else {
                    s4 = s5;
                  }
                  if (s4 !== peg$FAILED) {
                    if (input.charCodeAt(peg$currPos) === 58) {
                      s5 = peg$c2;
                      peg$currPos++;
                    } else {
                      s5 = peg$FAILED;
                      if (peg$silentFails === 0) {
                        peg$fail(peg$e2);
                      }
                    }
                    if (s5 !== peg$FAILED) {
                      s6 = peg$parse_();
                      s7 = peg$parseName();
                      if (s7 !== peg$FAILED) {
                        s8 = [];
                        for (; ; ) {
                          s9 = peg$currPos;
                          s10 = peg$parse_();
                          if (input.charCodeAt(peg$currPos) === 44) {
                            s11 = peg$c5;
                            peg$currPos++;
                          } else {
                            s11 = peg$FAILED;
                            if (peg$silentFails === 0) {
                              peg$fail(peg$e6);
                            }
                          }
                          if (s11 !== peg$FAILED) {
                            s12 = peg$parse_();
                            s13 = peg$parseName();
                            if (s13 !== peg$FAILED) {
                              peg$savedPos = s9;
                              s9 = peg$f5(s4, s7, s13);
                            } else {
                              peg$currPos = s9;
                              s9 = peg$FAILED;
                            }
                          } else {
                            peg$currPos = s9;
                            s9 = peg$FAILED;
                          }
                          if (s9 === peg$FAILED) {
                            break;
                          }
                          s8.push(s9);
                        }
                        s9 = peg$parse_();
                        s10 = peg$parseComment();
                        if (s10 === peg$FAILED) {
                          s10 = null;
                        }
                        peg$savedPos = s0;
                        s0 = peg$f6(s4, s7, s8);
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
              if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                s1 = peg$parse_();
                if (input.substr(peg$currPos, 5) === peg$c7) {
                  s2 = peg$c7;
                  peg$currPos += 5;
                } else {
                  s2 = peg$FAILED;
                  if (peg$silentFails === 0) {
                    peg$fail(peg$e8);
                  }
                }
                if (s2 !== peg$FAILED) {
                  s3 = peg$parseCycleGap();
                  if (s3 !== peg$FAILED) {
                    if (input.substr(peg$currPos, 5) === peg$c8) {
                      s4 = peg$c8;
                      peg$currPos += 5;
                    } else {
                      s4 = peg$FAILED;
                      if (peg$silentFails === 0) {
                        peg$fail(peg$e9);
                      }
                    }
                    if (s4 === peg$FAILED) {
                      if (input.substr(peg$currPos, 6) === peg$c9) {
                        s4 = peg$c9;
                        peg$currPos += 6;
                      } else {
                        s4 = peg$FAILED;
                        if (peg$silentFails === 0) {
                          peg$fail(peg$e10);
                        }
                      }
                      if (s4 === peg$FAILED) {
                        if (input.substr(peg$currPos, 7) === peg$c10) {
                          s4 = peg$c10;
                          peg$currPos += 7;
                        } else {
                          s4 = peg$FAILED;
                          if (peg$silentFails === 0) {
                            peg$fail(peg$e11);
                          }
                        }
                        if (s4 === peg$FAILED) {
                          if (input.substr(peg$currPos, 9) === peg$c11) {
                            s4 = peg$c11;
                            peg$currPos += 9;
                          } else {
                            s4 = peg$FAILED;
                            if (peg$silentFails === 0) {
                              peg$fail(peg$e12);
                            }
                          }
                          if (s4 === peg$FAILED) {
                            if (input.substr(peg$currPos, 6) === peg$c12) {
                              s4 = peg$c12;
                              peg$currPos += 6;
                            } else {
                              s4 = peg$FAILED;
                              if (peg$silentFails === 0) {
                                peg$fail(peg$e13);
                              }
                            }
                          }
                        }
                      }
                    }
                    if (s4 !== peg$FAILED) {
                      s5 = peg$parse_();
                      s6 = peg$parseComment();
                      if (s6 === peg$FAILED) {
                        s6 = null;
                      }
                      s7 = peg$currPos;
                      peg$silentFails++;
                      if (input.length > peg$currPos) {
                        s8 = input.charAt(peg$currPos);
                        peg$currPos++;
                      } else {
                        s8 = peg$FAILED;
                        if (peg$silentFails === 0) {
                          peg$fail(peg$e14);
                        }
                      }
                      peg$silentFails--;
                      if (s8 === peg$FAILED) {
                        s7 = void 0;
                      } else {
                        peg$currPos = s7;
                        s7 = peg$FAILED;
                      }
                      if (s7 !== peg$FAILED) {
                        peg$savedPos = s0;
                        s0 = peg$f7(s4);
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
                if (s0 === peg$FAILED) {
                  s0 = peg$currPos;
                  s1 = peg$parse_();
                  if (input.substr(peg$currPos, 7) === peg$c13) {
                    s2 = peg$c13;
                    peg$currPos += 7;
                  } else {
                    s2 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e15);
                    }
                  }
                  if (s2 === peg$FAILED) {
                    if (input.substr(peg$currPos, 6) === peg$c14) {
                      s2 = peg$c14;
                      peg$currPos += 6;
                    } else {
                      s2 = peg$FAILED;
                      if (peg$silentFails === 0) {
                        peg$fail(peg$e16);
                      }
                    }
                  }
                  if (s2 !== peg$FAILED) {
                    s3 = peg$parse_();
                    if (input.charCodeAt(peg$currPos) === 58) {
                      s4 = peg$c2;
                      peg$currPos++;
                    } else {
                      s4 = peg$FAILED;
                      if (peg$silentFails === 0) {
                        peg$fail(peg$e2);
                      }
                    }
                    if (s4 !== peg$FAILED) {
                      s5 = peg$parse_();
                      s6 = peg$parseFrom();
                      if (s6 !== peg$FAILED) {
                        s7 = peg$parse_();
                        s8 = peg$parseArrow();
                        if (s8 !== peg$FAILED) {
                          s9 = peg$parse_();
                          s10 = peg$parseName();
                          if (s10 !== peg$FAILED) {
                            s11 = peg$parse_();
                            s12 = peg$parseComment();
                            if (s12 === peg$FAILED) {
                              s12 = null;
                            }
                            peg$savedPos = s0;
                            s0 = peg$f8(s6, s10);
                          } else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                          }
                        } else {
                          peg$currPos = s0;
                          s0 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                  if (s0 === peg$FAILED) {
                    s0 = peg$currPos;
                    s1 = peg$parse_();
                    if (input.substr(peg$currPos, 4) === peg$c15) {
                      s2 = peg$c15;
                      peg$currPos += 4;
                    } else {
                      s2 = peg$FAILED;
                      if (peg$silentFails === 0) {
                        peg$fail(peg$e17);
                      }
                    }
                    if (s2 !== peg$FAILED) {
                      s3 = peg$parse__();
                      if (s3 !== peg$FAILED) {
                        s4 = peg$currPos;
                        s5 = [];
                        for (; ; ) {
                          s6 = peg$currPos;
                          s7 = peg$currPos;
                          peg$silentFails++;
                          s8 = peg$parseArrow();
                          peg$silentFails--;
                          if (s8 === peg$FAILED) {
                            s7 = void 0;
                          } else {
                            peg$currPos = s7;
                            s7 = peg$FAILED;
                          }
                          if (s7 !== peg$FAILED) {
                            s8 = input.charAt(peg$currPos);
                            if (s8 !== "" && !(peg$charCode = s8.charCodeAt(0), peg$charCode === 10)) {
                              peg$currPos++;
                            } else {
                              s8 = peg$FAILED;
                              if (peg$silentFails === 0) {
                                peg$fail(peg$e18);
                              }
                            }
                            if (s8 !== peg$FAILED) {
                              s7 = [s7, s8];
                              s6 = s7;
                            } else {
                              peg$currPos = s6;
                              s6 = peg$FAILED;
                            }
                          } else {
                            peg$currPos = s6;
                            s6 = peg$FAILED;
                          }
                          if (s6 === peg$FAILED) {
                            break;
                          }
                          s5.push(s6);
                        }
                        if (s5.length < 1) {
                          s5 = peg$FAILED;
                        }
                        if (s5 !== peg$FAILED) {
                          s4 = input.substring(s4, peg$currPos);
                        } else {
                          s4 = s5;
                        }
                        if (s4 !== peg$FAILED) {
                          s5 = peg$parseArrow();
                          if (s5 !== peg$FAILED) {
                            s6 = peg$parse_();
                            s7 = peg$parseRest();
                            if (s7 !== peg$FAILED) {
                              peg$savedPos = s0;
                              s0 = peg$f9(s4, s7);
                            } else {
                              peg$currPos = s0;
                              s0 = peg$FAILED;
                            }
                          } else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                          }
                        } else {
                          peg$currPos = s0;
                          s0 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                    if (s0 === peg$FAILED) {
                      s0 = peg$currPos;
                      s1 = peg$parse_();
                      s2 = peg$parseFrom();
                      if (s2 !== peg$FAILED) {
                        s3 = peg$parse_();
                        s4 = peg$parseArrow();
                        if (s4 !== peg$FAILED) {
                          s5 = peg$parse_();
                          s6 = peg$parseName();
                          if (s6 !== peg$FAILED) {
                            s7 = peg$parse_();
                            if (input.charCodeAt(peg$currPos) === 58) {
                              s8 = peg$c2;
                              peg$currPos++;
                            } else {
                              s8 = peg$FAILED;
                              if (peg$silentFails === 0) {
                                peg$fail(peg$e2);
                              }
                            }
                            if (s8 !== peg$FAILED) {
                              s9 = peg$parse_();
                              s10 = peg$parseResult();
                              if (s10 !== peg$FAILED) {
                                s11 = peg$parseWithin();
                                if (s11 === peg$FAILED) {
                                  s11 = null;
                                }
                                s12 = peg$parse_();
                                s13 = peg$parseLabel();
                                if (s13 === peg$FAILED) {
                                  s13 = null;
                                }
                                s14 = peg$parse_();
                                s15 = peg$parseComment();
                                if (s15 === peg$FAILED) {
                                  s15 = null;
                                }
                                peg$savedPos = s0;
                                s0 = peg$f10(s2, s6, s10, s11, s13);
                              } else {
                                peg$currPos = s0;
                                s0 = peg$FAILED;
                              }
                            } else {
                              peg$currPos = s0;
                              s0 = peg$FAILED;
                            }
                          } else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                          }
                        } else {
                          peg$currPos = s0;
                          s0 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                      if (s0 === peg$FAILED) {
                        s0 = peg$parseBlank();
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    return s0;
  }
  function peg$parseFrom() {
    let s0, s1, s2, s3, s4, s5, s6, s7;
    s0 = peg$currPos;
    s1 = peg$parsePart();
    if (s1 !== peg$FAILED) {
      s2 = [];
      for (; ; ) {
        s3 = peg$currPos;
        s4 = peg$parse_();
        if (input.charCodeAt(peg$currPos) === 43) {
          s5 = peg$c16;
          peg$currPos++;
        } else {
          s5 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e19);
          }
        }
        if (s5 !== peg$FAILED) {
          s6 = peg$parse_();
          s7 = peg$parsePart();
          if (s7 !== peg$FAILED) {
            peg$savedPos = s3;
            s3 = peg$f11(s1, s7);
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
        if (s3 === peg$FAILED) {
          break;
        }
        s2.push(s3);
      }
      peg$savedPos = s0;
      s0 = peg$f12(s1, s2);
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsePart() {
    let s0, s1, s2, s3, s4, s5, s6, s7;
    s0 = peg$currPos;
    s1 = peg$parseName();
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      s3 = peg$parse_();
      if (input.charCodeAt(peg$currPos) === 91) {
        s4 = peg$c17;
        peg$currPos++;
      } else {
        s4 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e20);
        }
      }
      if (s4 !== peg$FAILED) {
        s5 = peg$currPos;
        s6 = [];
        for (; ; ) {
          s7 = input.charAt(peg$currPos);
          if (s7 !== "" && !(peg$charCode = s7.charCodeAt(0), peg$charCode === 93 || peg$charCode === 10)) {
            peg$currPos++;
          } else {
            s7 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e21);
            }
          }
          if (s7 === peg$FAILED) {
            break;
          }
          s6.push(s7);
        }
        if (s6.length < 1) {
          s6 = peg$FAILED;
        }
        if (s6 !== peg$FAILED) {
          s5 = input.substring(s5, peg$currPos);
        } else {
          s5 = s6;
        }
        if (s5 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 93) {
            s6 = peg$c18;
            peg$currPos++;
          } else {
            s6 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e22);
            }
          }
          if (s6 !== peg$FAILED) {
            peg$savedPos = s2;
            s2 = peg$f13(s1, s5);
          } else {
            peg$currPos = s2;
            s2 = peg$FAILED;
          }
        } else {
          peg$currPos = s2;
          s2 = peg$FAILED;
        }
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 === peg$FAILED) {
        s2 = null;
      }
      peg$savedPos = s0;
      s0 = peg$f14(s1, s2);
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parseResult() {
    let s0, s1, s2, s3, s4, s5, s6, s7;
    s0 = peg$currPos;
    if (input.charCodeAt(peg$currPos) === 63) {
      s1 = peg$c19;
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e23);
      }
    }
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$f15();
    }
    s0 = s1;
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      if (input.substr(peg$currPos, 4) === peg$c20) {
        s1 = peg$c20;
        peg$currPos += 4;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e24);
        }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse__();
        if (s2 !== peg$FAILED) {
          if (input.substr(peg$currPos, 6) === peg$c21) {
            s3 = peg$c21;
            peg$currPos += 6;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e25);
            }
          }
          if (s3 !== peg$FAILED) {
            peg$savedPos = s0;
            s0 = peg$f16();
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 4) === peg$c22) {
          s1 = peg$c22;
          peg$currPos += 4;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e26);
          }
        }
        if (s1 !== peg$FAILED) {
          s2 = peg$parse__();
          if (s2 !== peg$FAILED) {
            s3 = peg$parseName();
            if (s3 !== peg$FAILED) {
              peg$savedPos = s0;
              s0 = peg$f17(s3);
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          s1 = peg$parseEach();
          if (s1 !== peg$FAILED) {
            s2 = peg$parse__();
            if (s2 !== peg$FAILED) {
              if (input.substr(peg$currPos, 4) === peg$c20) {
                s3 = peg$c20;
                peg$currPos += 4;
              } else {
                s3 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$e24);
                }
              }
              if (s3 !== peg$FAILED) {
                s4 = peg$parse__();
                if (s4 !== peg$FAILED) {
                  s5 = peg$parseNum();
                  if (s5 !== peg$FAILED) {
                    s6 = peg$parseUnit();
                    if (s6 === peg$FAILED) {
                      s6 = null;
                    }
                    peg$savedPos = s0;
                    s0 = peg$f18(s1, s5, s6);
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
          if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            s1 = peg$parseNum();
            if (s1 !== peg$FAILED) {
              s2 = peg$currPos;
              s3 = peg$parse_();
              if (input.substr(peg$currPos, 2) === peg$c23) {
                s4 = peg$c23;
                peg$currPos += 2;
              } else {
                s4 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$e27);
                }
              }
              if (s4 !== peg$FAILED) {
                s5 = peg$parse__();
                if (s5 !== peg$FAILED) {
                  s6 = peg$parseNum();
                  if (s6 !== peg$FAILED) {
                    peg$savedPos = s2;
                    s2 = peg$f19(s1, s6);
                  } else {
                    peg$currPos = s2;
                    s2 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s2;
                  s2 = peg$FAILED;
                }
              } else {
                peg$currPos = s2;
                s2 = peg$FAILED;
              }
              if (s2 === peg$FAILED) {
                s2 = null;
              }
              s3 = peg$parse__();
              if (s3 !== peg$FAILED) {
                if (input.substr(peg$currPos, 2) === peg$c24) {
                  s4 = peg$c24;
                  peg$currPos += 2;
                } else {
                  s4 = peg$FAILED;
                  if (peg$silentFails === 0) {
                    peg$fail(peg$e28);
                  }
                }
                if (s4 === peg$FAILED) {
                  if (input.substr(peg$currPos, 4) === peg$c20) {
                    s4 = peg$c20;
                    peg$currPos += 4;
                  } else {
                    s4 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e24);
                    }
                  }
                }
                if (s4 !== peg$FAILED) {
                  s5 = peg$parse__();
                  if (s5 !== peg$FAILED) {
                    s6 = peg$parseNum();
                    if (s6 !== peg$FAILED) {
                      s7 = peg$parseUnit();
                      if (s7 === peg$FAILED) {
                        s7 = null;
                      }
                      peg$savedPos = s0;
                      s0 = peg$f20(s1, s2, s4, s6, s7);
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          }
        }
      }
    }
    return s0;
  }
  function peg$parseEach() {
    let s0, s1, s2, s3, s4, s5, s6, s7;
    s0 = peg$currPos;
    s1 = peg$parseNum();
    if (s1 !== peg$FAILED) {
      s2 = [];
      for (; ; ) {
        s3 = peg$currPos;
        s4 = peg$parse_();
        if (input.charCodeAt(peg$currPos) === 43) {
          s5 = peg$c16;
          peg$currPos++;
        } else {
          s5 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e19);
          }
        }
        if (s5 !== peg$FAILED) {
          s6 = peg$parse_();
          s7 = peg$parseNum();
          if (s7 !== peg$FAILED) {
            peg$savedPos = s3;
            s3 = peg$f21(s1, s7);
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
        if (s3 === peg$FAILED) {
          break;
        }
        s2.push(s3);
      }
      if (s2.length < 1) {
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s0 = peg$f22(s1, s2);
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parseUnit() {
    let s0, s1, s2, s3, s4;
    s0 = peg$currPos;
    s1 = [];
    for (; ; ) {
      s2 = input.charAt(peg$currPos);
      if (peg$charCode = s2.charCodeAt(0), peg$charCode === 32 || peg$charCode === 9) {
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e29);
        }
      }
      if (s2 === peg$FAILED) {
        break;
      }
      s1.push(s2);
    }
    if (s1.length < 1) {
      s1 = peg$FAILED;
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      s3 = [];
      for (; ; ) {
        s4 = input.charAt(peg$currPos);
        if (s4 !== "" && !(peg$charCode = s4.charCodeAt(0), peg$charCode === 44 || peg$charCode === 40 || peg$charCode === 10 || peg$charCode === 35)) {
          peg$currPos++;
        } else {
          s4 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e30);
          }
        }
        if (s4 === peg$FAILED) {
          break;
        }
        s3.push(s4);
      }
      if (s3.length < 1) {
        s3 = peg$FAILED;
      }
      if (s3 !== peg$FAILED) {
        s2 = input.substring(s2, peg$currPos);
      } else {
        s2 = s3;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s0 = peg$f23(s2);
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parseWithin() {
    let s0, s1, s2, s3, s4, s5, s6, s7, s8, s9;
    s0 = peg$currPos;
    s1 = peg$parse_();
    if (input.charCodeAt(peg$currPos) === 44) {
      s2 = peg$c5;
      peg$currPos++;
    } else {
      s2 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e6);
      }
    }
    if (s2 !== peg$FAILED) {
      s3 = peg$parse_();
      if (input.substr(peg$currPos, 6) === peg$c25) {
        s4 = peg$c25;
        peg$currPos += 6;
      } else {
        s4 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e31);
        }
      }
      if (s4 !== peg$FAILED) {
        s5 = peg$parse__();
        if (s5 !== peg$FAILED) {
          s6 = peg$currPos;
          if (input.charCodeAt(peg$currPos) === 63) {
            s7 = peg$c19;
            peg$currPos++;
          } else {
            s7 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e23);
            }
          }
          if (s7 !== peg$FAILED) {
            peg$savedPos = s6;
            s7 = peg$f24();
          }
          s6 = s7;
          if (s6 === peg$FAILED) {
            s6 = peg$currPos;
            if (input.substr(peg$currPos, 9) === peg$c26) {
              s7 = peg$c26;
              peg$currPos += 9;
            } else {
              s7 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$e32);
              }
            }
            if (s7 !== peg$FAILED) {
              peg$savedPos = s6;
              s7 = peg$f25();
            }
            s6 = s7;
            if (s6 === peg$FAILED) {
              s6 = peg$currPos;
              s7 = peg$parseNum();
              if (s7 !== peg$FAILED) {
                s8 = peg$parse_();
                if (input.substr(peg$currPos, 5) === peg$c27) {
                  s9 = peg$c27;
                  peg$currPos += 5;
                } else {
                  s9 = peg$FAILED;
                  if (peg$silentFails === 0) {
                    peg$fail(peg$e33);
                  }
                }
                if (s9 === peg$FAILED) {
                  if (input.substr(peg$currPos, 4) === peg$c28) {
                    s9 = peg$c28;
                    peg$currPos += 4;
                  } else {
                    s9 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e34);
                    }
                  }
                  if (s9 === peg$FAILED) {
                    if (input.substr(peg$currPos, 4) === peg$c29) {
                      s9 = peg$c29;
                      peg$currPos += 4;
                    } else {
                      s9 = peg$FAILED;
                      if (peg$silentFails === 0) {
                        peg$fail(peg$e35);
                      }
                    }
                    if (s9 === peg$FAILED) {
                      if (input.substr(peg$currPos, 3) === peg$c30) {
                        s9 = peg$c30;
                        peg$currPos += 3;
                      } else {
                        s9 = peg$FAILED;
                        if (peg$silentFails === 0) {
                          peg$fail(peg$e36);
                        }
                      }
                      if (s9 === peg$FAILED) {
                        if (input.substr(peg$currPos, 6) === peg$c31) {
                          s9 = peg$c31;
                          peg$currPos += 6;
                        } else {
                          s9 = peg$FAILED;
                          if (peg$silentFails === 0) {
                            peg$fail(peg$e37);
                          }
                        }
                        if (s9 === peg$FAILED) {
                          if (input.substr(peg$currPos, 5) === peg$c32) {
                            s9 = peg$c32;
                            peg$currPos += 5;
                          } else {
                            s9 = peg$FAILED;
                            if (peg$silentFails === 0) {
                              peg$fail(peg$e38);
                            }
                          }
                          if (s9 === peg$FAILED) {
                            if (input.substr(peg$currPos, 5) === peg$c33) {
                              s9 = peg$c33;
                              peg$currPos += 5;
                            } else {
                              s9 = peg$FAILED;
                              if (peg$silentFails === 0) {
                                peg$fail(peg$e39);
                              }
                            }
                            if (s9 === peg$FAILED) {
                              if (input.substr(peg$currPos, 4) === peg$c34) {
                                s9 = peg$c34;
                                peg$currPos += 4;
                              } else {
                                s9 = peg$FAILED;
                                if (peg$silentFails === 0) {
                                  peg$fail(peg$e40);
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
                if (s9 !== peg$FAILED) {
                  peg$savedPos = s6;
                  s6 = peg$f26(s7, s9);
                } else {
                  peg$currPos = s6;
                  s6 = peg$FAILED;
                }
              } else {
                peg$currPos = s6;
                s6 = peg$FAILED;
              }
            }
          }
          if (s6 !== peg$FAILED) {
            peg$savedPos = s0;
            s0 = peg$f27(s6);
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parseLabel() {
    let s0, s1, s2, s3, s4, s5, s6, s7, s8;
    s0 = peg$currPos;
    if (input.charCodeAt(peg$currPos) === 40) {
      s1 = peg$c35;
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e41);
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parse_();
      if (input.substr(peg$currPos, 6) === peg$c36) {
        s3 = peg$c36;
        peg$currPos += 6;
      } else {
        s3 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e42);
        }
      }
      if (s3 === peg$FAILED) {
        if (input.substr(peg$currPos, 8) === peg$c37) {
          s3 = peg$c37;
          peg$currPos += 8;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e43);
          }
        }
        if (s3 === peg$FAILED) {
          if (input.substr(peg$currPos, 7) === peg$c38) {
            s3 = peg$c38;
            peg$currPos += 7;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e44);
            }
          }
          if (s3 === peg$FAILED) {
            if (input.substr(peg$currPos, 7) === peg$c39) {
              s3 = peg$c39;
              peg$currPos += 7;
            } else {
              s3 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$e45);
              }
            }
          }
        }
      }
      if (s3 !== peg$FAILED) {
        s4 = peg$currPos;
        s5 = peg$parse_();
        if (input.charCodeAt(peg$currPos) === 44) {
          s6 = peg$c5;
          peg$currPos++;
        } else {
          s6 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e6);
          }
        }
        if (s6 !== peg$FAILED) {
          s7 = peg$parse_();
          if (input.substr(peg$currPos, 8) === peg$c40) {
            s8 = peg$c40;
            peg$currPos += 8;
          } else {
            s8 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e46);
            }
          }
          if (s8 !== peg$FAILED) {
            s5 = [s5, s6, s7, s8];
            s4 = s5;
          } else {
            peg$currPos = s4;
            s4 = peg$FAILED;
          }
        } else {
          peg$currPos = s4;
          s4 = peg$FAILED;
        }
        if (s4 === peg$FAILED) {
          s4 = null;
        }
        s5 = peg$parse_();
        if (input.charCodeAt(peg$currPos) === 41) {
          s6 = peg$c41;
          peg$currPos++;
        } else {
          s6 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e47);
          }
        }
        if (s6 !== peg$FAILED) {
          peg$savedPos = s0;
          s0 = peg$f28(s3, s4);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsePlanLine() {
    let s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12, s13, s14, s15, s16;
    s0 = peg$parseSpec();
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      s1 = peg$parse_();
      if (input.substr(peg$currPos, 7) === peg$c0) {
        s2 = peg$c0;
        peg$currPos += 7;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e0);
        }
      }
      if (s2 !== peg$FAILED) {
        s3 = peg$parse__();
        if (s3 !== peg$FAILED) {
          s4 = peg$parseRest();
          if (s4 !== peg$FAILED) {
            peg$savedPos = s0;
            s0 = peg$f29(s4);
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$parse_();
        if (input.substr(peg$currPos, 5) === peg$c42) {
          s2 = peg$c42;
          peg$currPos += 5;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e48);
          }
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parse__();
          if (s3 !== peg$FAILED) {
            s4 = peg$parseDate();
            if (s4 !== peg$FAILED) {
              s5 = peg$parse_();
              s6 = peg$parseComment();
              if (s6 === peg$FAILED) {
                s6 = null;
              }
              peg$savedPos = s0;
              s0 = peg$f30(s4);
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          s1 = peg$parse_();
          if (input.substr(peg$currPos, 4) === peg$c43) {
            s2 = peg$c43;
            peg$currPos += 4;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e49);
            }
          }
          if (s2 !== peg$FAILED) {
            s3 = peg$parse__();
            if (s3 !== peg$FAILED) {
              s4 = peg$parseWantName();
              if (s4 !== peg$FAILED) {
                s5 = peg$parse__();
                if (s5 !== peg$FAILED) {
                  s6 = peg$currPos;
                  if (input.charCodeAt(peg$currPos) === 43) {
                    s7 = peg$c16;
                    peg$currPos++;
                  } else {
                    s7 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e19);
                    }
                  }
                  if (s7 !== peg$FAILED) {
                    s8 = peg$parse_();
                    s7 = [s7, s8];
                    s6 = s7;
                  } else {
                    peg$currPos = s6;
                    s6 = peg$FAILED;
                  }
                  if (s6 === peg$FAILED) {
                    s6 = null;
                  }
                  s7 = peg$parseNum();
                  if (s7 !== peg$FAILED) {
                    s8 = peg$parse__();
                    if (s8 !== peg$FAILED) {
                      if (input.charCodeAt(peg$currPos) === 97) {
                        s9 = peg$c44;
                        peg$currPos++;
                      } else {
                        s9 = peg$FAILED;
                        if (peg$silentFails === 0) {
                          peg$fail(peg$e50);
                        }
                      }
                      if (s9 === peg$FAILED) {
                        if (input.substr(peg$currPos, 3) === peg$c45) {
                          s9 = peg$c45;
                          peg$currPos += 3;
                        } else {
                          s9 = peg$FAILED;
                          if (peg$silentFails === 0) {
                            peg$fail(peg$e51);
                          }
                        }
                        if (s9 === peg$FAILED) {
                          if (input.substr(peg$currPos, 4) === peg$c46) {
                            s9 = peg$c46;
                            peg$currPos += 4;
                          } else {
                            s9 = peg$FAILED;
                            if (peg$silentFails === 0) {
                              peg$fail(peg$e52);
                            }
                          }
                        }
                      }
                      if (s9 !== peg$FAILED) {
                        s10 = peg$parse__();
                        if (s10 !== peg$FAILED) {
                          if (input.substr(peg$currPos, 4) === peg$c28) {
                            s11 = peg$c28;
                            peg$currPos += 4;
                          } else {
                            s11 = peg$FAILED;
                            if (peg$silentFails === 0) {
                              peg$fail(peg$e34);
                            }
                          }
                          if (s11 === peg$FAILED) {
                            if (input.substr(peg$currPos, 5) === peg$c32) {
                              s11 = peg$c32;
                              peg$currPos += 5;
                            } else {
                              s11 = peg$FAILED;
                              if (peg$silentFails === 0) {
                                peg$fail(peg$e38);
                              }
                            }
                          }
                          if (s11 !== peg$FAILED) {
                            s12 = peg$currPos;
                            s13 = peg$parse__();
                            if (s13 !== peg$FAILED) {
                              if (input.substr(peg$currPos, 2) === peg$c47) {
                                s14 = peg$c47;
                                peg$currPos += 2;
                              } else {
                                s14 = peg$FAILED;
                                if (peg$silentFails === 0) {
                                  peg$fail(peg$e53);
                                }
                              }
                              if (s14 !== peg$FAILED) {
                                s15 = peg$parse__();
                                if (s15 !== peg$FAILED) {
                                  s16 = peg$parseDate();
                                  if (s16 !== peg$FAILED) {
                                    peg$savedPos = s12;
                                    s12 = peg$f31(s4, s6, s7, s11, s16);
                                  } else {
                                    peg$currPos = s12;
                                    s12 = peg$FAILED;
                                  }
                                } else {
                                  peg$currPos = s12;
                                  s12 = peg$FAILED;
                                }
                              } else {
                                peg$currPos = s12;
                                s12 = peg$FAILED;
                              }
                            } else {
                              peg$currPos = s12;
                              s12 = peg$FAILED;
                            }
                            if (s12 === peg$FAILED) {
                              s12 = null;
                            }
                            s13 = peg$parse_();
                            s14 = peg$parseComment();
                            if (s14 === peg$FAILED) {
                              s14 = null;
                            }
                            peg$savedPos = s0;
                            s0 = peg$f32(s4, s6, s7, s11, s12);
                          } else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                          }
                        } else {
                          peg$currPos = s0;
                          s0 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
          if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            s1 = peg$parse_();
            if (input.substr(peg$currPos, 4) === peg$c43) {
              s2 = peg$c43;
              peg$currPos += 4;
            } else {
              s2 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$e49);
              }
            }
            if (s2 !== peg$FAILED) {
              s3 = peg$parse__();
              if (s3 !== peg$FAILED) {
                s4 = peg$parseWantName();
                if (s4 !== peg$FAILED) {
                  s5 = peg$currPos;
                  s6 = peg$parse__();
                  if (s6 !== peg$FAILED) {
                    s7 = peg$parseNum();
                    if (s7 !== peg$FAILED) {
                      peg$savedPos = s5;
                      s5 = peg$f33(s4, s7);
                    } else {
                      peg$currPos = s5;
                      s5 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s5;
                    s5 = peg$FAILED;
                  }
                  if (s5 === peg$FAILED) {
                    s5 = null;
                  }
                  s6 = peg$currPos;
                  s7 = peg$parse__();
                  if (s7 !== peg$FAILED) {
                    if (input.substr(peg$currPos, 2) === peg$c47) {
                      s8 = peg$c47;
                      peg$currPos += 2;
                    } else {
                      s8 = peg$FAILED;
                      if (peg$silentFails === 0) {
                        peg$fail(peg$e53);
                      }
                    }
                    if (s8 !== peg$FAILED) {
                      s9 = peg$parse__();
                      if (s9 !== peg$FAILED) {
                        s10 = peg$parseDate();
                        if (s10 !== peg$FAILED) {
                          peg$savedPos = s6;
                          s6 = peg$f34(s4, s5, s10);
                        } else {
                          peg$currPos = s6;
                          s6 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s6;
                        s6 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s6;
                      s6 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s6;
                    s6 = peg$FAILED;
                  }
                  if (s6 === peg$FAILED) {
                    s6 = null;
                  }
                  s7 = peg$parse_();
                  s8 = peg$parseComment();
                  if (s8 === peg$FAILED) {
                    s8 = null;
                  }
                  peg$savedPos = s0;
                  s0 = peg$f35(s4, s5, s6);
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
            if (s0 === peg$FAILED) {
              s0 = peg$currPos;
              s1 = peg$parse_();
              if (input.substr(peg$currPos, 5) === peg$c48) {
                s2 = peg$c48;
                peg$currPos += 5;
              } else {
                s2 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$e54);
                }
              }
              if (s2 !== peg$FAILED) {
                s3 = peg$parse__();
                if (s3 !== peg$FAILED) {
                  if (input.substr(peg$currPos, 4) === peg$c28) {
                    s4 = peg$c28;
                    peg$currPos += 4;
                  } else {
                    s4 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e34);
                    }
                  }
                  if (s4 !== peg$FAILED) {
                    s5 = peg$parse__();
                    if (s5 !== peg$FAILED) {
                      s6 = peg$parseEveryPart();
                      if (s6 !== peg$FAILED) {
                        s7 = [];
                        for (; ; ) {
                          s8 = peg$currPos;
                          s9 = peg$parse_();
                          if (input.charCodeAt(peg$currPos) === 44) {
                            s10 = peg$c5;
                            peg$currPos++;
                          } else {
                            s10 = peg$FAILED;
                            if (peg$silentFails === 0) {
                              peg$fail(peg$e6);
                            }
                          }
                          if (s10 !== peg$FAILED) {
                            s11 = peg$parse_();
                            s12 = peg$parseEveryPart();
                            if (s12 !== peg$FAILED) {
                              peg$savedPos = s8;
                              s8 = peg$f36(s6, s12);
                            } else {
                              peg$currPos = s8;
                              s8 = peg$FAILED;
                            }
                          } else {
                            peg$currPos = s8;
                            s8 = peg$FAILED;
                          }
                          if (s8 === peg$FAILED) {
                            break;
                          }
                          s7.push(s8);
                        }
                        s8 = peg$currPos;
                        s9 = peg$parse__();
                        if (s9 !== peg$FAILED) {
                          if (input.substr(peg$currPos, 4) === peg$c20) {
                            s10 = peg$c20;
                            peg$currPos += 4;
                          } else {
                            s10 = peg$FAILED;
                            if (peg$silentFails === 0) {
                              peg$fail(peg$e24);
                            }
                          }
                          if (s10 !== peg$FAILED) {
                            s11 = peg$parse__();
                            if (s11 !== peg$FAILED) {
                              s12 = peg$parseDate();
                              if (s12 !== peg$FAILED) {
                                peg$savedPos = s8;
                                s8 = peg$f37(s6, s7, s12);
                              } else {
                                peg$currPos = s8;
                                s8 = peg$FAILED;
                              }
                            } else {
                              peg$currPos = s8;
                              s8 = peg$FAILED;
                            }
                          } else {
                            peg$currPos = s8;
                            s8 = peg$FAILED;
                          }
                        } else {
                          peg$currPos = s8;
                          s8 = peg$FAILED;
                        }
                        if (s8 === peg$FAILED) {
                          s8 = null;
                        }
                        s9 = peg$parse_();
                        s10 = peg$parseComment();
                        if (s10 === peg$FAILED) {
                          s10 = null;
                        }
                        peg$savedPos = s0;
                        s0 = peg$f38(s6, s7, s8);
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
              if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                s1 = peg$parse_();
                if (input.substr(peg$currPos, 3) === peg$c49) {
                  s2 = peg$c49;
                  peg$currPos += 3;
                } else {
                  s2 = peg$FAILED;
                  if (peg$silentFails === 0) {
                    peg$fail(peg$e55);
                  }
                }
                if (s2 !== peg$FAILED) {
                  s3 = peg$parse__();
                  if (s3 !== peg$FAILED) {
                    s4 = peg$currPos;
                    s5 = [];
                    for (; ; ) {
                      s6 = input.charAt(peg$currPos);
                      if (s6 !== "" && !(peg$charCode = s6.charCodeAt(0), peg$charCode === 58 || peg$charCode === 10)) {
                        peg$currPos++;
                      } else {
                        s6 = peg$FAILED;
                        if (peg$silentFails === 0) {
                          peg$fail(peg$e4);
                        }
                      }
                      if (s6 === peg$FAILED) {
                        break;
                      }
                      s5.push(s6);
                    }
                    if (s5.length < 1) {
                      s5 = peg$FAILED;
                    }
                    if (s5 !== peg$FAILED) {
                      s4 = input.substring(s4, peg$currPos);
                    } else {
                      s4 = s5;
                    }
                    if (s4 !== peg$FAILED) {
                      if (input.charCodeAt(peg$currPos) === 58) {
                        s5 = peg$c2;
                        peg$currPos++;
                      } else {
                        s5 = peg$FAILED;
                        if (peg$silentFails === 0) {
                          peg$fail(peg$e2);
                        }
                      }
                      if (s5 !== peg$FAILED) {
                        s6 = peg$parse_();
                        s7 = peg$currPos;
                        s8 = [];
                        for (; ; ) {
                          s9 = input.charAt(peg$currPos);
                          if (s9 !== "" && !(peg$charCode = s9.charCodeAt(0), peg$charCode === 10)) {
                            peg$currPos++;
                          } else {
                            s9 = peg$FAILED;
                            if (peg$silentFails === 0) {
                              peg$fail(peg$e18);
                            }
                          }
                          if (s9 === peg$FAILED) {
                            break;
                          }
                          s8.push(s9);
                        }
                        if (s8.length < 1) {
                          s8 = peg$FAILED;
                        }
                        if (s8 !== peg$FAILED) {
                          s7 = input.substring(s7, peg$currPos);
                        } else {
                          s7 = s8;
                        }
                        if (s7 !== peg$FAILED) {
                          peg$savedPos = s0;
                          s0 = peg$f39(s4, s7);
                        } else {
                          peg$currPos = s0;
                          s0 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
                if (s0 === peg$FAILED) {
                  s0 = peg$currPos;
                  s1 = peg$parse_();
                  s2 = peg$parseDate();
                  if (s2 !== peg$FAILED) {
                    s3 = peg$parse__();
                    if (s3 !== peg$FAILED) {
                      if (input.substr(peg$currPos, 3) === peg$c49) {
                        s4 = peg$c49;
                        peg$currPos += 3;
                      } else {
                        s4 = peg$FAILED;
                        if (peg$silentFails === 0) {
                          peg$fail(peg$e55);
                        }
                      }
                      if (s4 === peg$FAILED) {
                        if (input.substr(peg$currPos, 6) === peg$c50) {
                          s4 = peg$c50;
                          peg$currPos += 6;
                        } else {
                          s4 = peg$FAILED;
                          if (peg$silentFails === 0) {
                            peg$fail(peg$e56);
                          }
                        }
                      }
                      if (s4 !== peg$FAILED) {
                        s5 = peg$parse__();
                        if (s5 !== peg$FAILED) {
                          s6 = peg$currPos;
                          s7 = [];
                          for (; ; ) {
                            s8 = input.charAt(peg$currPos);
                            if (s8 !== "" && !(peg$charCode = s8.charCodeAt(0), peg$charCode === 58 || peg$charCode === 10)) {
                              peg$currPos++;
                            } else {
                              s8 = peg$FAILED;
                              if (peg$silentFails === 0) {
                                peg$fail(peg$e4);
                              }
                            }
                            if (s8 === peg$FAILED) {
                              break;
                            }
                            s7.push(s8);
                          }
                          if (s7.length < 1) {
                            s7 = peg$FAILED;
                          }
                          if (s7 !== peg$FAILED) {
                            s6 = input.substring(s6, peg$currPos);
                          } else {
                            s6 = s7;
                          }
                          if (s6 !== peg$FAILED) {
                            if (input.charCodeAt(peg$currPos) === 58) {
                              s7 = peg$c2;
                              peg$currPos++;
                            } else {
                              s7 = peg$FAILED;
                              if (peg$silentFails === 0) {
                                peg$fail(peg$e2);
                              }
                            }
                            if (s7 !== peg$FAILED) {
                              s8 = peg$parse_();
                              s9 = peg$currPos;
                              s10 = [];
                              for (; ; ) {
                                s11 = input.charAt(peg$currPos);
                                if (s11 !== "" && !(peg$charCode = s11.charCodeAt(0), peg$charCode === 10)) {
                                  peg$currPos++;
                                } else {
                                  s11 = peg$FAILED;
                                  if (peg$silentFails === 0) {
                                    peg$fail(peg$e18);
                                  }
                                }
                                if (s11 === peg$FAILED) {
                                  break;
                                }
                                s10.push(s11);
                              }
                              if (s10.length < 1) {
                                s10 = peg$FAILED;
                              }
                              if (s10 !== peg$FAILED) {
                                s9 = input.substring(s9, peg$currPos);
                              } else {
                                s9 = s10;
                              }
                              if (s9 !== peg$FAILED) {
                                peg$savedPos = s0;
                                s0 = peg$f40(s2, s4, s6, s9);
                              } else {
                                peg$currPos = s0;
                                s0 = peg$FAILED;
                              }
                            } else {
                              peg$currPos = s0;
                              s0 = peg$FAILED;
                            }
                          } else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                          }
                        } else {
                          peg$currPos = s0;
                          s0 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                  if (s0 === peg$FAILED) {
                    s0 = peg$currPos;
                    s1 = peg$parse_();
                    if (input.substr(peg$currPos, 6) === peg$c50) {
                      s2 = peg$c50;
                      peg$currPos += 6;
                    } else {
                      s2 = peg$FAILED;
                      if (peg$silentFails === 0) {
                        peg$fail(peg$e56);
                      }
                    }
                    if (s2 !== peg$FAILED) {
                      s3 = peg$parse__();
                      if (s3 !== peg$FAILED) {
                        s4 = peg$currPos;
                        s5 = [];
                        for (; ; ) {
                          s6 = input.charAt(peg$currPos);
                          if (s6 !== "" && !(peg$charCode = s6.charCodeAt(0), peg$charCode === 58 || peg$charCode === 10)) {
                            peg$currPos++;
                          } else {
                            s6 = peg$FAILED;
                            if (peg$silentFails === 0) {
                              peg$fail(peg$e4);
                            }
                          }
                          if (s6 === peg$FAILED) {
                            break;
                          }
                          s5.push(s6);
                        }
                        if (s5.length < 1) {
                          s5 = peg$FAILED;
                        }
                        if (s5 !== peg$FAILED) {
                          s4 = input.substring(s4, peg$currPos);
                        } else {
                          s4 = s5;
                        }
                        if (s4 !== peg$FAILED) {
                          if (input.charCodeAt(peg$currPos) === 58) {
                            s5 = peg$c2;
                            peg$currPos++;
                          } else {
                            s5 = peg$FAILED;
                            if (peg$silentFails === 0) {
                              peg$fail(peg$e2);
                            }
                          }
                          if (s5 !== peg$FAILED) {
                            s6 = peg$parse_();
                            s7 = peg$currPos;
                            s8 = [];
                            for (; ; ) {
                              s9 = input.charAt(peg$currPos);
                              if (s9 !== "" && !(peg$charCode = s9.charCodeAt(0), peg$charCode === 10)) {
                                peg$currPos++;
                              } else {
                                s9 = peg$FAILED;
                                if (peg$silentFails === 0) {
                                  peg$fail(peg$e18);
                                }
                              }
                              if (s9 === peg$FAILED) {
                                break;
                              }
                              s8.push(s9);
                            }
                            if (s8.length < 1) {
                              s8 = peg$FAILED;
                            }
                            if (s8 !== peg$FAILED) {
                              s7 = input.substring(s7, peg$currPos);
                            } else {
                              s7 = s8;
                            }
                            if (s7 !== peg$FAILED) {
                              peg$savedPos = s0;
                              s0 = peg$f41(s4, s7);
                            } else {
                              peg$currPos = s0;
                              s0 = peg$FAILED;
                            }
                          } else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                          }
                        } else {
                          peg$currPos = s0;
                          s0 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                    if (s0 === peg$FAILED) {
                      s0 = peg$currPos;
                      s1 = peg$parse_();
                      s2 = peg$parseDate();
                      if (s2 !== peg$FAILED) {
                        s3 = peg$parse__();
                        if (s3 !== peg$FAILED) {
                          s4 = peg$currPos;
                          s5 = input.charAt(peg$currPos);
                          if (peg$charCode = s5.charCodeAt(0), peg$charCode === 43 || peg$charCode === 45 || peg$charCode === 8722) {
                            peg$currPos++;
                          } else {
                            s5 = peg$FAILED;
                            if (peg$silentFails === 0) {
                              peg$fail(peg$e57);
                            }
                          }
                          if (s5 !== peg$FAILED) {
                            s6 = peg$parse_();
                            peg$savedPos = s4;
                            s4 = peg$f42(s2, s5);
                          } else {
                            peg$currPos = s4;
                            s4 = peg$FAILED;
                          }
                          if (s4 === peg$FAILED) {
                            s4 = null;
                          }
                          s5 = peg$parsePart();
                          if (s5 !== peg$FAILED) {
                            s6 = [];
                            for (; ; ) {
                              s7 = peg$currPos;
                              s8 = peg$parse_();
                              if (input.charCodeAt(peg$currPos) === 44) {
                                s9 = peg$c5;
                                peg$currPos++;
                              } else {
                                s9 = peg$FAILED;
                                if (peg$silentFails === 0) {
                                  peg$fail(peg$e6);
                                }
                              }
                              if (s9 !== peg$FAILED) {
                                s10 = peg$parse_();
                                s11 = peg$parsePart();
                                if (s11 !== peg$FAILED) {
                                  peg$savedPos = s7;
                                  s7 = peg$f43(s2, s4, s5, s11);
                                } else {
                                  peg$currPos = s7;
                                  s7 = peg$FAILED;
                                }
                              } else {
                                peg$currPos = s7;
                                s7 = peg$FAILED;
                              }
                              if (s7 === peg$FAILED) {
                                break;
                              }
                              s6.push(s7);
                            }
                            s7 = peg$parse_();
                            s8 = peg$parseComment();
                            if (s8 === peg$FAILED) {
                              s8 = null;
                            }
                            peg$savedPos = s0;
                            s0 = peg$f44(s2, s4, s5, s6);
                          } else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                          }
                        } else {
                          peg$currPos = s0;
                          s0 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                      if (s0 === peg$FAILED) {
                        s0 = peg$parseBlank();
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    return s0;
  }
  function peg$parseEveryPart() {
    let s0, s1, s2, s3, s4, s5, s6, s7, s8, s9;
    s0 = peg$currPos;
    s1 = peg$currPos;
    s2 = [];
    for (; ; ) {
      s3 = peg$currPos;
      s4 = peg$currPos;
      peg$silentFails++;
      s5 = peg$currPos;
      s6 = peg$parse__();
      if (s6 !== peg$FAILED) {
        if (input.substr(peg$currPos, 4) === peg$c20) {
          s7 = peg$c20;
          peg$currPos += 4;
        } else {
          s7 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e24);
          }
        }
        if (s7 !== peg$FAILED) {
          s8 = peg$parse__();
          if (s8 !== peg$FAILED) {
            s9 = peg$parseDate();
            if (s9 !== peg$FAILED) {
              s6 = [s6, s7, s8, s9];
              s5 = s6;
            } else {
              peg$currPos = s5;
              s5 = peg$FAILED;
            }
          } else {
            peg$currPos = s5;
            s5 = peg$FAILED;
          }
        } else {
          peg$currPos = s5;
          s5 = peg$FAILED;
        }
      } else {
        peg$currPos = s5;
        s5 = peg$FAILED;
      }
      peg$silentFails--;
      if (s5 === peg$FAILED) {
        s4 = void 0;
      } else {
        peg$currPos = s4;
        s4 = peg$FAILED;
      }
      if (s4 !== peg$FAILED) {
        s5 = peg$currPos;
        peg$silentFails++;
        s6 = peg$parseArrow();
        peg$silentFails--;
        if (s6 === peg$FAILED) {
          s5 = void 0;
        } else {
          peg$currPos = s5;
          s5 = peg$FAILED;
        }
        if (s5 !== peg$FAILED) {
          s6 = input.charAt(peg$currPos);
          if (s6 !== "" && !(peg$charCode = s6.charCodeAt(0), peg$charCode === 8594 || peg$charCode === 58 || peg$charCode === 91 || peg$charCode === 93 || peg$charCode === 43 || peg$charCode === 40 || peg$charCode === 41 || peg$charCode === 44 || peg$charCode === 35 || peg$charCode === 10)) {
            peg$currPos++;
          } else {
            s6 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e58);
            }
          }
          if (s6 !== peg$FAILED) {
            s4 = [s4, s5, s6];
            s3 = s4;
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      } else {
        peg$currPos = s3;
        s3 = peg$FAILED;
      }
      if (s3 === peg$FAILED) {
        break;
      }
      s2.push(s3);
    }
    if (s2.length < 1) {
      s2 = peg$FAILED;
    }
    if (s2 !== peg$FAILED) {
      s1 = input.substring(s1, peg$currPos);
    } else {
      s1 = s2;
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      s3 = peg$parse_();
      if (input.charCodeAt(peg$currPos) === 91) {
        s4 = peg$c17;
        peg$currPos++;
      } else {
        s4 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e20);
        }
      }
      if (s4 !== peg$FAILED) {
        s5 = peg$currPos;
        s6 = [];
        for (; ; ) {
          s7 = input.charAt(peg$currPos);
          if (s7 !== "" && !(peg$charCode = s7.charCodeAt(0), peg$charCode === 93 || peg$charCode === 10)) {
            peg$currPos++;
          } else {
            s7 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e21);
            }
          }
          if (s7 === peg$FAILED) {
            break;
          }
          s6.push(s7);
        }
        if (s6.length < 1) {
          s6 = peg$FAILED;
        }
        if (s6 !== peg$FAILED) {
          s5 = input.substring(s5, peg$currPos);
        } else {
          s5 = s6;
        }
        if (s5 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 93) {
            s6 = peg$c18;
            peg$currPos++;
          } else {
            s6 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e22);
            }
          }
          if (s6 !== peg$FAILED) {
            peg$savedPos = s2;
            s2 = peg$f45(s1, s5);
          } else {
            peg$currPos = s2;
            s2 = peg$FAILED;
          }
        } else {
          peg$currPos = s2;
          s2 = peg$FAILED;
        }
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 === peg$FAILED) {
        s2 = null;
      }
      peg$savedPos = s0;
      s0 = peg$f46(s1, s2);
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parseGroupRule() {
    let s0, s1, s2, s3, s4, s5, s6, s7, s8, s9;
    s0 = peg$currPos;
    if (input.substr(peg$currPos, 3) === peg$c51) {
      s1 = peg$c51;
      peg$currPos += 3;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e59);
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$currPos;
        s4 = [];
        for (; ; ) {
          s5 = input.charAt(peg$currPos);
          if (s5 !== "" && !(peg$charCode = s5.charCodeAt(0), peg$charCode === 32 || peg$charCode === 9 || peg$charCode === 10 || peg$charCode === 35)) {
            peg$currPos++;
          } else {
            s5 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e60);
            }
          }
          if (s5 === peg$FAILED) {
            break;
          }
          s4.push(s5);
        }
        if (s4.length < 1) {
          s4 = peg$FAILED;
        }
        if (s4 !== peg$FAILED) {
          s3 = input.substring(s3, peg$currPos);
        } else {
          s3 = s4;
        }
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s0 = peg$f47(s3);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      if (input.substr(peg$currPos, 6) === peg$c52) {
        s1 = peg$c52;
        peg$currPos += 6;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e61);
        }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse__();
        if (s2 !== peg$FAILED) {
          if (input.substr(peg$currPos, 4) === peg$c53) {
            s3 = peg$c53;
            peg$currPos += 4;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e62);
            }
          }
          if (s3 === peg$FAILED) {
            if (input.substr(peg$currPos, 4) === peg$c54) {
              s3 = peg$c54;
              peg$currPos += 4;
            } else {
              s3 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$e63);
              }
            }
            if (s3 === peg$FAILED) {
              if (input.substr(peg$currPos, 6) === peg$c55) {
                s3 = peg$c55;
                peg$currPos += 6;
              } else {
                s3 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$e64);
                }
              }
            }
          }
          if (s3 !== peg$FAILED) {
            peg$savedPos = s0;
            s0 = peg$f48(s3);
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 3) === peg$c56) {
          s1 = peg$c56;
          peg$currPos += 3;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e65);
          }
        }
        if (s1 !== peg$FAILED) {
          s2 = peg$parse__();
          if (s2 !== peg$FAILED) {
            s3 = peg$currPos;
            s4 = [];
            for (; ; ) {
              s5 = input.charAt(peg$currPos);
              if (s5 !== "" && !(peg$charCode = s5.charCodeAt(0), peg$charCode === 32 || peg$charCode === 9 || peg$charCode === 10 || peg$charCode === 35)) {
                peg$currPos++;
              } else {
                s5 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$e60);
                }
              }
              if (s5 === peg$FAILED) {
                break;
              }
              s4.push(s5);
            }
            if (s4.length < 1) {
              s4 = peg$FAILED;
            }
            if (s4 !== peg$FAILED) {
              s3 = input.substring(s3, peg$currPos);
            } else {
              s3 = s4;
            }
            if (s3 !== peg$FAILED) {
              peg$savedPos = s0;
              s0 = peg$f49(s3);
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          if (input.substr(peg$currPos, 6) === peg$c57) {
            s1 = peg$c57;
            peg$currPos += 6;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e66);
            }
          }
          if (s1 !== peg$FAILED) {
            s2 = peg$parse__();
            if (s2 !== peg$FAILED) {
              s3 = peg$parseNum();
              if (s3 !== peg$FAILED) {
                s4 = peg$parse__();
                if (s4 !== peg$FAILED) {
                  if (input.substr(peg$currPos, 11) === peg$c58) {
                    s5 = peg$c58;
                    peg$currPos += 11;
                  } else {
                    s5 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e67);
                    }
                  }
                  if (s5 !== peg$FAILED) {
                    s6 = peg$parse__();
                    if (s6 !== peg$FAILED) {
                      s7 = peg$parseNum();
                      if (s7 !== peg$FAILED) {
                        peg$savedPos = s0;
                        s0 = peg$f50(s3, s7);
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
          if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            if (input.substr(peg$currPos, 5) === peg$c59) {
              s1 = peg$c59;
              peg$currPos += 5;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$e68);
              }
            }
            if (s1 !== peg$FAILED) {
              s2 = peg$parse__();
              if (s2 !== peg$FAILED) {
                s3 = peg$currPos;
                s4 = [];
                for (; ; ) {
                  s5 = input.charAt(peg$currPos);
                  if (s5 !== "" && !(peg$charCode = s5.charCodeAt(0), peg$charCode === 32 || peg$charCode === 9 || peg$charCode === 10 || peg$charCode === 35)) {
                    peg$currPos++;
                  } else {
                    s5 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e60);
                    }
                  }
                  if (s5 === peg$FAILED) {
                    break;
                  }
                  s4.push(s5);
                }
                if (s4.length < 1) {
                  s4 = peg$FAILED;
                }
                if (s4 !== peg$FAILED) {
                  s3 = input.substring(s3, peg$currPos);
                } else {
                  s3 = s4;
                }
                if (s3 !== peg$FAILED) {
                  s4 = peg$parse__();
                  if (s4 !== peg$FAILED) {
                    if (input.substr(peg$currPos, 8) === peg$c60) {
                      s5 = peg$c60;
                      peg$currPos += 8;
                    } else {
                      s5 = peg$FAILED;
                      if (peg$silentFails === 0) {
                        peg$fail(peg$e69);
                      }
                    }
                    if (s5 !== peg$FAILED) {
                      peg$savedPos = s0;
                      s0 = peg$f51(s3);
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
            if (s0 === peg$FAILED) {
              s0 = peg$currPos;
              if (input.substr(peg$currPos, 5) === peg$c59) {
                s1 = peg$c59;
                peg$currPos += 5;
              } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$e68);
                }
              }
              if (s1 !== peg$FAILED) {
                s2 = peg$parse__();
                if (s2 !== peg$FAILED) {
                  s3 = peg$currPos;
                  s4 = [];
                  for (; ; ) {
                    s5 = input.charAt(peg$currPos);
                    if (s5 !== "" && !(peg$charCode = s5.charCodeAt(0), peg$charCode === 32 || peg$charCode === 9 || peg$charCode === 10 || peg$charCode === 35)) {
                      peg$currPos++;
                    } else {
                      s5 = peg$FAILED;
                      if (peg$silentFails === 0) {
                        peg$fail(peg$e60);
                      }
                    }
                    if (s5 === peg$FAILED) {
                      break;
                    }
                    s4.push(s5);
                  }
                  if (s4.length < 1) {
                    s4 = peg$FAILED;
                  }
                  if (s4 !== peg$FAILED) {
                    s3 = input.substring(s3, peg$currPos);
                  } else {
                    s3 = s4;
                  }
                  if (s3 !== peg$FAILED) {
                    s4 = peg$parse__();
                    if (s4 !== peg$FAILED) {
                      if (input.substr(peg$currPos, 2) === peg$c61) {
                        s5 = peg$c61;
                        peg$currPos += 2;
                      } else {
                        s5 = peg$FAILED;
                        if (peg$silentFails === 0) {
                          peg$fail(peg$e70);
                        }
                      }
                      if (s5 !== peg$FAILED) {
                        s6 = peg$parse__();
                        if (s6 !== peg$FAILED) {
                          s7 = peg$currPos;
                          s8 = [];
                          for (; ; ) {
                            s9 = input.charAt(peg$currPos);
                            if (s9 !== "" && !(peg$charCode = s9.charCodeAt(0), peg$charCode === 35 || peg$charCode === 10)) {
                              peg$currPos++;
                            } else {
                              s9 = peg$FAILED;
                              if (peg$silentFails === 0) {
                                peg$fail(peg$e71);
                              }
                            }
                            if (s9 === peg$FAILED) {
                              break;
                            }
                            s8.push(s9);
                          }
                          if (s8.length < 1) {
                            s8 = peg$FAILED;
                          }
                          if (s8 !== peg$FAILED) {
                            s7 = input.substring(s7, peg$currPos);
                          } else {
                            s7 = s8;
                          }
                          if (s7 !== peg$FAILED) {
                            peg$savedPos = s0;
                            s0 = peg$f52(s3, s7);
                          } else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                          }
                        } else {
                          peg$currPos = s0;
                          s0 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
              if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                if (input.substr(peg$currPos, 11) === peg$c62) {
                  s1 = peg$c62;
                  peg$currPos += 11;
                } else {
                  s1 = peg$FAILED;
                  if (peg$silentFails === 0) {
                    peg$fail(peg$e72);
                  }
                }
                if (s1 !== peg$FAILED) {
                  s2 = peg$parse__();
                  if (s2 !== peg$FAILED) {
                    s3 = peg$currPos;
                    s4 = [];
                    for (; ; ) {
                      s5 = input.charAt(peg$currPos);
                      if (s5 !== "" && !(peg$charCode = s5.charCodeAt(0), peg$charCode === 35 || peg$charCode === 10)) {
                        peg$currPos++;
                      } else {
                        s5 = peg$FAILED;
                        if (peg$silentFails === 0) {
                          peg$fail(peg$e71);
                        }
                      }
                      if (s5 === peg$FAILED) {
                        break;
                      }
                      s4.push(s5);
                    }
                    if (s4.length < 1) {
                      s4 = peg$FAILED;
                    }
                    if (s4 !== peg$FAILED) {
                      s3 = input.substring(s3, peg$currPos);
                    } else {
                      s3 = s4;
                    }
                    if (s3 !== peg$FAILED) {
                      peg$savedPos = s0;
                      s0 = peg$f53(s3);
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
                if (s0 === peg$FAILED) {
                  s0 = peg$currPos;
                  if (input.substr(peg$currPos, 15) === peg$c63) {
                    s1 = peg$c63;
                    peg$currPos += 15;
                  } else {
                    s1 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e73);
                    }
                  }
                  if (s1 !== peg$FAILED) {
                    s2 = peg$parse__();
                    if (s2 !== peg$FAILED) {
                      s3 = peg$currPos;
                      s4 = [];
                      for (; ; ) {
                        s5 = input.charAt(peg$currPos);
                        if (s5 !== "" && !(peg$charCode = s5.charCodeAt(0), peg$charCode === 32 || peg$charCode === 9 || peg$charCode === 10 || peg$charCode === 35)) {
                          peg$currPos++;
                        } else {
                          s5 = peg$FAILED;
                          if (peg$silentFails === 0) {
                            peg$fail(peg$e60);
                          }
                        }
                        if (s5 === peg$FAILED) {
                          break;
                        }
                        s4.push(s5);
                      }
                      if (s4.length < 1) {
                        s4 = peg$FAILED;
                      }
                      if (s4 !== peg$FAILED) {
                        s3 = input.substring(s3, peg$currPos);
                      } else {
                        s3 = s4;
                      }
                      if (s3 !== peg$FAILED) {
                        peg$savedPos = s0;
                        s0 = peg$f54(s3);
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                }
              }
            }
          }
        }
      }
    }
    return s0;
  }
  function peg$parseWantName() {
    let s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10;
    s0 = peg$currPos;
    s1 = peg$currPos;
    s2 = [];
    for (; ; ) {
      s3 = peg$currPos;
      s4 = peg$currPos;
      peg$silentFails++;
      s5 = peg$currPos;
      s6 = peg$parse__();
      if (s6 !== peg$FAILED) {
        s7 = peg$parseNum();
        if (s7 !== peg$FAILED) {
          s6 = [s6, s7];
          s5 = s6;
        } else {
          peg$currPos = s5;
          s5 = peg$FAILED;
        }
      } else {
        peg$currPos = s5;
        s5 = peg$FAILED;
      }
      peg$silentFails--;
      if (s5 === peg$FAILED) {
        s4 = void 0;
      } else {
        peg$currPos = s4;
        s4 = peg$FAILED;
      }
      if (s4 !== peg$FAILED) {
        s5 = peg$currPos;
        peg$silentFails++;
        s6 = peg$currPos;
        s7 = peg$parse__();
        if (s7 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 43) {
            s8 = peg$c16;
            peg$currPos++;
          } else {
            s8 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e19);
            }
          }
          if (s8 !== peg$FAILED) {
            s7 = [s7, s8];
            s6 = s7;
          } else {
            peg$currPos = s6;
            s6 = peg$FAILED;
          }
        } else {
          peg$currPos = s6;
          s6 = peg$FAILED;
        }
        peg$silentFails--;
        if (s6 === peg$FAILED) {
          s5 = void 0;
        } else {
          peg$currPos = s5;
          s5 = peg$FAILED;
        }
        if (s5 !== peg$FAILED) {
          s6 = peg$currPos;
          peg$silentFails++;
          s7 = peg$currPos;
          s8 = peg$parse__();
          if (s8 !== peg$FAILED) {
            if (input.substr(peg$currPos, 2) === peg$c47) {
              s9 = peg$c47;
              peg$currPos += 2;
            } else {
              s9 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$e53);
              }
            }
            if (s9 !== peg$FAILED) {
              s10 = peg$parse__();
              if (s10 !== peg$FAILED) {
                s8 = [s8, s9, s10];
                s7 = s8;
              } else {
                peg$currPos = s7;
                s7 = peg$FAILED;
              }
            } else {
              peg$currPos = s7;
              s7 = peg$FAILED;
            }
          } else {
            peg$currPos = s7;
            s7 = peg$FAILED;
          }
          peg$silentFails--;
          if (s7 === peg$FAILED) {
            s6 = void 0;
          } else {
            peg$currPos = s6;
            s6 = peg$FAILED;
          }
          if (s6 !== peg$FAILED) {
            s7 = input.charAt(peg$currPos);
            if (s7 !== "" && !(peg$charCode = s7.charCodeAt(0), peg$charCode === 35 || peg$charCode === 10)) {
              peg$currPos++;
            } else {
              s7 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$e71);
              }
            }
            if (s7 !== peg$FAILED) {
              s4 = [s4, s5, s6, s7];
              s3 = s4;
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      } else {
        peg$currPos = s3;
        s3 = peg$FAILED;
      }
      if (s3 === peg$FAILED) {
        break;
      }
      s2.push(s3);
    }
    if (s2.length < 1) {
      s2 = peg$FAILED;
    }
    if (s2 !== peg$FAILED) {
      s1 = input.substring(s1, peg$currPos);
    } else {
      s1 = s2;
    }
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$f55(s1);
    }
    s0 = s1;
    return s0;
  }
  function peg$parseDate() {
    let s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11;
    s0 = peg$currPos;
    s1 = peg$currPos;
    s2 = input.charAt(peg$currPos);
    if (peg$charCode = s2.charCodeAt(0), peg$charCode >= 48 && peg$charCode <= 57) {
      peg$currPos++;
    } else {
      s2 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e74);
      }
    }
    if (s2 !== peg$FAILED) {
      s3 = input.charAt(peg$currPos);
      if (peg$charCode = s3.charCodeAt(0), peg$charCode >= 48 && peg$charCode <= 57) {
        peg$currPos++;
      } else {
        s3 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e74);
        }
      }
      if (s3 !== peg$FAILED) {
        s4 = input.charAt(peg$currPos);
        if (peg$charCode = s4.charCodeAt(0), peg$charCode >= 48 && peg$charCode <= 57) {
          peg$currPos++;
        } else {
          s4 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e74);
          }
        }
        if (s4 !== peg$FAILED) {
          s5 = input.charAt(peg$currPos);
          if (peg$charCode = s5.charCodeAt(0), peg$charCode >= 48 && peg$charCode <= 57) {
            peg$currPos++;
          } else {
            s5 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e74);
            }
          }
          if (s5 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 45) {
              s6 = peg$c64;
              peg$currPos++;
            } else {
              s6 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$e75);
              }
            }
            if (s6 !== peg$FAILED) {
              s7 = input.charAt(peg$currPos);
              if (peg$charCode = s7.charCodeAt(0), peg$charCode >= 48 && peg$charCode <= 57) {
                peg$currPos++;
              } else {
                s7 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$e74);
                }
              }
              if (s7 !== peg$FAILED) {
                s8 = input.charAt(peg$currPos);
                if (peg$charCode = s8.charCodeAt(0), peg$charCode >= 48 && peg$charCode <= 57) {
                  peg$currPos++;
                } else {
                  s8 = peg$FAILED;
                  if (peg$silentFails === 0) {
                    peg$fail(peg$e74);
                  }
                }
                if (s8 !== peg$FAILED) {
                  if (input.charCodeAt(peg$currPos) === 45) {
                    s9 = peg$c64;
                    peg$currPos++;
                  } else {
                    s9 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e75);
                    }
                  }
                  if (s9 !== peg$FAILED) {
                    s10 = input.charAt(peg$currPos);
                    if (peg$charCode = s10.charCodeAt(0), peg$charCode >= 48 && peg$charCode <= 57) {
                      peg$currPos++;
                    } else {
                      s10 = peg$FAILED;
                      if (peg$silentFails === 0) {
                        peg$fail(peg$e74);
                      }
                    }
                    if (s10 !== peg$FAILED) {
                      s11 = input.charAt(peg$currPos);
                      if (peg$charCode = s11.charCodeAt(0), peg$charCode >= 48 && peg$charCode <= 57) {
                        peg$currPos++;
                      } else {
                        s11 = peg$FAILED;
                        if (peg$silentFails === 0) {
                          peg$fail(peg$e74);
                        }
                      }
                      if (s11 !== peg$FAILED) {
                        s2 = [s2, s3, s4, s5, s6, s7, s8, s9, s10, s11];
                        s1 = s2;
                      } else {
                        peg$currPos = s1;
                        s1 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s1;
                      s1 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s1;
                    s1 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s1;
                  s1 = peg$FAILED;
                }
              } else {
                peg$currPos = s1;
                s1 = peg$FAILED;
              }
            } else {
              peg$currPos = s1;
              s1 = peg$FAILED;
            }
          } else {
            peg$currPos = s1;
            s1 = peg$FAILED;
          }
        } else {
          peg$currPos = s1;
          s1 = peg$FAILED;
        }
      } else {
        peg$currPos = s1;
        s1 = peg$FAILED;
      }
    } else {
      peg$currPos = s1;
      s1 = peg$FAILED;
    }
    if (s1 !== peg$FAILED) {
      s0 = input.substring(s0, peg$currPos);
    } else {
      s0 = s1;
    }
    return s0;
  }
  function peg$parseSpec() {
    let s0, s1, s2, s3, s4, s5, s6, s7, s8;
    s0 = peg$currPos;
    s1 = peg$parse_();
    if (input.substr(peg$currPos, 4) === peg$c65) {
      s2 = peg$c65;
      peg$currPos += 4;
    } else {
      s2 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e76);
      }
    }
    if (s2 !== peg$FAILED) {
      s3 = peg$parse__();
      if (s3 !== peg$FAILED) {
        s4 = peg$parseNum();
        if (s4 !== peg$FAILED) {
          s5 = peg$parse_();
          s6 = peg$parseComment();
          if (s6 === peg$FAILED) {
            s6 = null;
          }
          s7 = peg$currPos;
          peg$silentFails++;
          if (input.length > peg$currPos) {
            s8 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s8 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e14);
            }
          }
          peg$silentFails--;
          if (s8 === peg$FAILED) {
            s7 = void 0;
          } else {
            peg$currPos = s7;
            s7 = peg$FAILED;
          }
          if (s7 !== peg$FAILED) {
            peg$savedPos = s0;
            s0 = peg$f56(s4);
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parseCycleGap() {
    let s0, s1, s2, s3;
    s0 = peg$currPos;
    s1 = peg$parse_();
    if (input.charCodeAt(peg$currPos) === 58) {
      s2 = peg$c2;
      peg$currPos++;
    } else {
      s2 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e2);
      }
    }
    if (s2 !== peg$FAILED) {
      s3 = peg$parse_();
      s1 = [s1, s2, s3];
      s0 = s1;
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 === peg$FAILED) {
      s0 = peg$parse__();
    }
    return s0;
  }
  function peg$parseBlank() {
    let s0, s1, s2, s3, s4;
    s0 = peg$currPos;
    s1 = peg$parse_();
    s2 = peg$parseComment();
    if (s2 === peg$FAILED) {
      s2 = null;
    }
    s3 = peg$currPos;
    peg$silentFails++;
    if (input.length > peg$currPos) {
      s4 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s4 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e14);
      }
    }
    peg$silentFails--;
    if (s4 === peg$FAILED) {
      s3 = void 0;
    } else {
      peg$currPos = s3;
      s3 = peg$FAILED;
    }
    if (s3 !== peg$FAILED) {
      peg$savedPos = s0;
      s0 = peg$f57();
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parseName() {
    let s0, s1, s2, s3, s4, s5;
    s0 = peg$currPos;
    s1 = peg$currPos;
    s2 = [];
    for (; ; ) {
      s3 = peg$currPos;
      s4 = peg$currPos;
      peg$silentFails++;
      s5 = peg$parseArrow();
      peg$silentFails--;
      if (s5 === peg$FAILED) {
        s4 = void 0;
      } else {
        peg$currPos = s4;
        s4 = peg$FAILED;
      }
      if (s4 !== peg$FAILED) {
        s5 = input.charAt(peg$currPos);
        if (s5 !== "" && !(peg$charCode = s5.charCodeAt(0), peg$charCode === 8594 || peg$charCode === 58 || peg$charCode === 91 || peg$charCode === 93 || peg$charCode === 43 || peg$charCode === 40 || peg$charCode === 41 || peg$charCode === 44 || peg$charCode === 35 || peg$charCode === 10)) {
          peg$currPos++;
        } else {
          s5 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e58);
          }
        }
        if (s5 !== peg$FAILED) {
          s4 = [s4, s5];
          s3 = s4;
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      } else {
        peg$currPos = s3;
        s3 = peg$FAILED;
      }
      if (s3 === peg$FAILED) {
        break;
      }
      s2.push(s3);
    }
    if (s2.length < 1) {
      s2 = peg$FAILED;
    }
    if (s2 !== peg$FAILED) {
      s1 = input.substring(s1, peg$currPos);
    } else {
      s1 = s2;
    }
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$f58(s1);
    }
    s0 = s1;
    return s0;
  }
  function peg$parseNum() {
    let s0, s1, s2, s3, s4, s5, s6, s7, s8, s9;
    s0 = peg$currPos;
    s1 = peg$currPos;
    s2 = peg$currPos;
    s3 = [];
    for (; ; ) {
      s4 = input.charAt(peg$currPos);
      if (peg$charCode = s4.charCodeAt(0), peg$charCode >= 48 && peg$charCode <= 57) {
        peg$currPos++;
      } else {
        s4 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e74);
        }
      }
      if (s4 === peg$FAILED) {
        break;
      }
      s3.push(s4);
    }
    if (s3.length < 1) {
      s3 = peg$FAILED;
    }
    if (s3 !== peg$FAILED) {
      s4 = [];
      for (; ; ) {
        s5 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 44) {
          s6 = peg$c5;
          peg$currPos++;
        } else {
          s6 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e6);
          }
        }
        if (s6 !== peg$FAILED) {
          s7 = input.charAt(peg$currPos);
          if (peg$charCode = s7.charCodeAt(0), peg$charCode >= 48 && peg$charCode <= 57) {
            peg$currPos++;
          } else {
            s7 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e74);
            }
          }
          if (s7 !== peg$FAILED) {
            s8 = input.charAt(peg$currPos);
            if (peg$charCode = s8.charCodeAt(0), peg$charCode >= 48 && peg$charCode <= 57) {
              peg$currPos++;
            } else {
              s8 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$e74);
              }
            }
            if (s8 !== peg$FAILED) {
              s9 = input.charAt(peg$currPos);
              if (peg$charCode = s9.charCodeAt(0), peg$charCode >= 48 && peg$charCode <= 57) {
                peg$currPos++;
              } else {
                s9 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$e74);
                }
              }
              if (s9 !== peg$FAILED) {
                s6 = [s6, s7, s8, s9];
                s5 = s6;
              } else {
                peg$currPos = s5;
                s5 = peg$FAILED;
              }
            } else {
              peg$currPos = s5;
              s5 = peg$FAILED;
            }
          } else {
            peg$currPos = s5;
            s5 = peg$FAILED;
          }
        } else {
          peg$currPos = s5;
          s5 = peg$FAILED;
        }
        if (s5 === peg$FAILED) {
          break;
        }
        s4.push(s5);
      }
      s5 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 46) {
        s6 = peg$c66;
        peg$currPos++;
      } else {
        s6 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e77);
        }
      }
      if (s6 !== peg$FAILED) {
        s7 = [];
        for (; ; ) {
          s8 = input.charAt(peg$currPos);
          if (peg$charCode = s8.charCodeAt(0), peg$charCode >= 48 && peg$charCode <= 57) {
            peg$currPos++;
          } else {
            s8 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e74);
            }
          }
          if (s8 === peg$FAILED) {
            break;
          }
          s7.push(s8);
        }
        if (s7.length < 1) {
          s7 = peg$FAILED;
        }
        if (s7 !== peg$FAILED) {
          s6 = [s6, s7];
          s5 = s6;
        } else {
          peg$currPos = s5;
          s5 = peg$FAILED;
        }
      } else {
        peg$currPos = s5;
        s5 = peg$FAILED;
      }
      if (s5 === peg$FAILED) {
        s5 = null;
      }
      s3 = [s3, s4, s5];
      s2 = s3;
    } else {
      peg$currPos = s2;
      s2 = peg$FAILED;
    }
    if (s2 !== peg$FAILED) {
      s1 = input.substring(s1, peg$currPos);
    } else {
      s1 = s2;
    }
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$f59(s1);
    }
    s0 = s1;
    return s0;
  }
  function peg$parseArrow() {
    let s0;
    if (input.charCodeAt(peg$currPos) === 8594) {
      s0 = peg$c67;
      peg$currPos++;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e78);
      }
    }
    if (s0 === peg$FAILED) {
      if (input.substr(peg$currPos, 2) === peg$c68) {
        s0 = peg$c68;
        peg$currPos += 2;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e79);
        }
      }
    }
    return s0;
  }
  function peg$parseRest() {
    let s0, s1, s2, s3;
    s0 = peg$currPos;
    s1 = peg$currPos;
    s2 = [];
    for (; ; ) {
      s3 = input.charAt(peg$currPos);
      if (s3 !== "" && !(peg$charCode = s3.charCodeAt(0), peg$charCode === 35 || peg$charCode === 10)) {
        peg$currPos++;
      } else {
        s3 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e71);
        }
      }
      if (s3 === peg$FAILED) {
        break;
      }
      s2.push(s3);
    }
    if (s2.length < 1) {
      s2 = peg$FAILED;
    }
    if (s2 !== peg$FAILED) {
      s1 = input.substring(s1, peg$currPos);
    } else {
      s1 = s2;
    }
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$f60(s1);
    }
    s0 = s1;
    return s0;
  }
  function peg$parseComment() {
    let s0, s1, s2, s3;
    s0 = peg$currPos;
    if (input.charCodeAt(peg$currPos) === 35) {
      s1 = peg$c69;
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e80);
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = [];
      for (; ; ) {
        s3 = input.charAt(peg$currPos);
        if (s3 !== "" && !(peg$charCode = s3.charCodeAt(0), peg$charCode === 10)) {
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e18);
          }
        }
        if (s3 === peg$FAILED) {
          break;
        }
        s2.push(s3);
      }
      s1 = [s1, s2];
      s0 = s1;
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parse_() {
    let s0, s1;
    s0 = [];
    for (; ; ) {
      s1 = input.charAt(peg$currPos);
      if (peg$charCode = s1.charCodeAt(0), peg$charCode === 32 || peg$charCode === 9) {
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e29);
        }
      }
      if (s1 === peg$FAILED) {
        break;
      }
      s0.push(s1);
    }
    return s0;
  }
  function peg$parse__() {
    let s0, s1;
    s0 = [];
    for (; ; ) {
      s1 = input.charAt(peg$currPos);
      if (peg$charCode = s1.charCodeAt(0), peg$charCode === 32 || peg$charCode === 9) {
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e29);
        }
      }
      if (s1 === peg$FAILED) {
        break;
      }
      s0.push(s1);
    }
    if (s0.length < 1) {
      s0 = peg$FAILED;
    }
    return s0;
  }
  peg$result = peg$startRuleFunction();
  const peg$success = peg$result !== peg$FAILED && peg$currPos === input.length;
  function peg$throw() {
    if (peg$result !== peg$FAILED && peg$currPos < input.length) {
      peg$fail(peg$endExpectation());
    }
    throw peg$buildStructuredError(
      peg$maxFailExpected,
      peg$maxFailPos < input.length ? peg$getUnicode(peg$maxFailPos) : null,
      peg$maxFailPos < input.length ? peg$computeLocation(peg$maxFailPos, peg$maxFailPos + 1) : peg$computeLocation(peg$maxFailPos, peg$maxFailPos)
    );
  }
  if (options.peg$library) {
    return (
      /** @type {any} */
      {
        peg$result,
        peg$currPos,
        peg$FAILED,
        peg$maxFailExpected,
        peg$maxFailPos,
        peg$success,
        peg$throw: peg$success ? void 0 : peg$throw
      }
    );
  }
  if (peg$success) {
    return peg$result;
  } else {
    peg$throw();
  }
}

// ../../../../packages/ledger/src/read/parse-line.ts
function parseGraphLine(text) {
  try {
    return peg$parse(text, { startRule: "GraphLine" });
  } catch {
    return void 0;
  }
}
function parsePlanLine(text) {
  try {
    return peg$parse(text, { startRule: "PlanLine" });
  } catch {
    return void 0;
  }
}

// ../../../../packages/ledger/src/read/read-thing.ts
var PAGE = /\s*\[([^\]\n]+)\]\s*$/;
var UNTIL = /\s+until (\d{4}-\d{2}-\d{2})\s*$/;
var NAMED = /^(business|opens|offer|proof|channel)(?: ([^:]*?))?(?: \(([^)]+)\))?:\s*(.*)$/;
var CLAIM = /^claim "([^"]+)": (proof on the site|no proof on the site)$/;
var ANSWERS = /^answers "([^"]+)"$/;
var SITE = /^site (\S+)(?: \(([^)]+)\))?$/;
function readThing(text, source, line) {
  const trimmed = text.trim();
  if (trimmed === "own") {
    return { word: "own", name: "own", source, line };
  }
  const site = SITE.exec(trimmed);
  if (site) {
    return { word: "site", name: site[1], ...site[2] ? { kind: site[2] } : {}, source, line };
  }
  const { rest, page, until } = endsOf(trimmed);
  const claim = CLAIM.exec(rest);
  if (claim) {
    return withEnds({ word: "claim", name: claim[1], proved: claim[2] === "proof on the site", source, line }, page, until);
  }
  const answers = ANSWERS.exec(rest);
  if (answers) {
    return withEnds({ word: "answers", name: answers[1], source, line }, page, until);
  }
  const named = NAMED.exec(rest);
  if (named) {
    const thing = { word: named[1], name: (named[2] ?? "").trim(), words: named[4].trim(), source, line };
    if (named[3]) {
      thing.kind = named[3];
    }
    return withEnds(thing, page, until);
  }
  return void 0;
}
function endsOf(text) {
  let rest = text;
  const until = UNTIL.exec(rest);
  if (until) {
    rest = rest.slice(0, until.index);
  }
  const page = PAGE.exec(rest);
  if (page) {
    rest = rest.slice(0, page.index);
  }
  return { rest: rest.trim(), page: page?.[1], until: until?.[1] };
}
function withEnds(thing, page, until) {
  return { ...thing, ...page ? { page } : {}, ...until ? { until } : {} };
}

// ../../../../packages/ledger/src/read/source-word.ts
var AT_THE_END = /\s*\((stated|observed|inferred)\)\s*$/;
function splitSource(text) {
  const found = AT_THE_END.exec(text);
  if (!found) {
    return { text, source: "stated", written: false };
  }
  return { text: text.slice(0, found.index), source: found[1], written: true };
}

// ../../../../packages/ledger/src/read/told-for-paste.ts
var PASTE = /^paste(?=[\s(]|$)/;
function toldForPaste(source) {
  return source.replace(PASTE, "told");
}

// ../../../../packages/ledger/src/read/read-graph.ts
function readGraph(lines) {
  const graph = emptyGraph();
  const unread = [];
  for (const numbered of lines) {
    const read = readOneLine(graph, numbered);
    if (!read) {
      unread.push(numbered);
    }
  }
  return { graph, unread };
}
function readOneLine(graph, numbered) {
  const whole = parseGraphLine(numbered.text);
  if (whole !== void 0 && (whole.kind === "fact" || !splitSource(numbered.text).written)) {
    addToGraph(graph, whole, numbered.line);
    return true;
  }
  const { text, source } = splitSource(numbered.text);
  const shape = parseGraphLine(text);
  if (shape !== void 0) {
    addToGraph(graph, shape, numbered.line);
    return true;
  }
  const thing = readThing(text, source, numbered.line);
  if (thing !== void 0) {
    graph.things = [...graph.things ?? [], thing];
    return true;
  }
  return false;
}
function emptyGraph() {
  return { facts: [], groups: [], links: [], whens: [], removes: [], areas: [], icons: [] };
}
function addToGraph(graph, shape, line) {
  switch (shape.kind) {
    case "extends":
      graph.extends = shape.file;
      return;
    case "fact":
      graph.facts.push({ fact: shape.fact, source: toldForPaste(shape.source), line });
      return;
    case "cycle":
      graph.cycle = shape.frequency;
      return;
    case "group":
      graph.groups.push({ name: shape.name, rule: shape.rule, line });
      return;
    case "area":
      graph.areas.push({ name: shape.name, members: shape.members, line });
      return;
    case "icon":
      graph.icons.push({ icon: shape.icon, members: shape.members, line });
      return;
    case "remove":
      graph.removes.push({ from: shape.from, to: shape.to, line });
      return;
    case "when":
      graph.whens.push({ when: shape.when, event: shape.event, line });
      return;
    case "link":
      graph.links.push(linkOf(shape, line));
      return;
    default:
      return;
  }
}
function linkOf(shape, line) {
  const link = {
    from: shape.from,
    to: shape.to,
    result: shape.result,
    within: shape.within,
    downside: shape.downside,
    line
  };
  if (shape.label) {
    link.label = shape.label;
  }
  return link;
}

// ../../../../packages/ledger/src/read/read-plan-extra.ts
var EVERY = /^every (month|2 weeks) (.+?)(?: from (\d{4}-\d{2}-\d{2}))?$/;
var ON = /^on (\d{4}-\d{2}-\d{2})(?: to (\d{4}-\d{2}-\d{2}))?:\s*(.+)$/;
function readOtherRepeat(text, line) {
  const found = EVERY.exec(text.trim());
  if (!found) {
    return void 0;
  }
  const repeat = { every: found[1], name: found[2].trim(), line };
  if (found[3]) {
    repeat.from = found[3];
  }
  return repeat;
}
function readOn(text, line) {
  const found = ON.exec(text.trim());
  return found ? { from: found[1], to: found[2] ?? found[1], words: found[3].trim(), line } : void 0;
}

// ../../../../packages/ledger/src/read/read-plan.ts
function readPlan(lines) {
  const plan = emptyPlan();
  const unread = [];
  for (const numbered of lines) {
    if (!readOneLine2(plan, numbered)) {
      unread.push(numbered);
    }
  }
  return { plan, unread };
}
function readOneLine2(plan, numbered) {
  const { text, source } = splitSource(numbered.text);
  const shape = parsePlanLine(text);
  if (shape !== void 0) {
    addToPlan(plan, shape, numbered.line);
    if (shape.kind === "every" && source === "inferred") {
      plan.repeats[plan.repeats.length - 1].inferred = true;
    }
    return true;
  }
  const repeat = readOtherRepeat(text, numbered.line);
  if (repeat !== void 0) {
    if (source === "inferred") {
      repeat.inferred = true;
    }
    plan.otherRepeats = [...plan.otherRepeats ?? [], repeat];
    return true;
  }
  const on = readOn(text, numbered.line);
  if (on !== void 0) {
    plan.ons = [...plan.ons ?? [], on];
    return true;
  }
  return false;
}
function emptyPlan() {
  return { repeats: [], hows: {}, scripts: {}, weekHows: {}, weekScripts: {}, entries: [] };
}
function addToPlan(plan, shape, line) {
  switch (shape.kind) {
    case "extends":
      plan.extends = shape.file;
      return;
    case "start":
      plan.start = shape.date;
      return;
    case "want":
      plan.want = wantOf(shape);
      return;
    case "every":
      plan.repeats.push(repeatOf(shape, line));
      return;
    case "how":
    case "script":
      addWords(plan, shape);
      return;
    case "entry":
      plan.entries.push({ date: shape.date, op: shape.op, methods: shape.methods, line });
      return;
    default:
      return;
  }
}
function wantOf(shape) {
  if (shape.per) {
    const want = { fact: shape.fact, per: shape.per };
    if (shape.by) {
      want.by = shape.by;
    }
    if (shape.grows) {
      want.grows = true;
    }
    return want;
  }
  return { fact: shape.fact, n: shape.n, by: shape.by };
}
function repeatOf(shape, line) {
  const repeat = { every: shape.every, methods: shape.methods, line };
  if (shape.from) {
    repeat.from = shape.from;
  }
  return repeat;
}
function addWords(plan, shape) {
  if (shape.week) {
    addWeekWords(plan, shape, mondayOf(shape.week));
    return;
  }
  if (shape.kind === "how") {
    plan.hows[shape.thing] = shape.words;
    return;
  }
  plan.scripts[shape.thing] = [...plan.scripts[shape.thing] ?? [], shape.words];
}
function addWeekWords(plan, shape, week) {
  if (shape.kind === "how") {
    plan.weekHows[week] = { ...plan.weekHows[week] ?? {}, [shape.thing]: shape.words };
    return;
  }
  const thatWeek = plan.weekScripts[week] ?? {};
  thatWeek[shape.thing] = [...thatWeek[shape.thing] ?? [], shape.words];
  plan.weekScripts[week] = thatWeek;
}

// ../../../../packages/ledger/src/read/split-parts.ts
var HEADING = /^=== (graph|plan|done|summary) ===$/;
var SPEC_LINE2 = /^spec (\d+)$/;
function splitParts(text) {
  const split = { parts: {}, outside: [] };
  let current;
  text.split(/\r?\n/).forEach((lineText, index) => {
    const line = index + 1;
    const heading = HEADING.exec(lineText.trim());
    if (heading) {
      current = startPart(split, heading[1], line, lineText);
      return;
    }
    if (current) {
      split.parts[current]?.push({ line, text: lineText });
      return;
    }
    readBeforeTheParts(split, line, lineText);
  });
  return split;
}
function startPart(split, name, line, text) {
  if (split.parts[name]) {
    split.outside.push({ part: name, line, text });
    return name;
  }
  split.parts[name] = [];
  return name;
}
function readBeforeTheParts(split, line, text) {
  const trimmed = text.trim();
  if (trimmed === "") {
    return;
  }
  const spec = SPEC_LINE2.exec(trimmed);
  if (spec && split.spec === void 0) {
    split.spec = Number(spec[1]);
    return;
  }
  split.outside.push({ part: "before the parts", line, text });
}

// ../../../../packages/ledger/src/read/tidy-pasted.ts
var CURLY_DOUBLE = /[\u201C\u201D\u201E\u201F]/g;
var CURLY_SINGLE = /[\u2018\u2019\u201A\u201B]/g;
var ODD_SPACES = /[\u00A0\u2000-\u200A\u202F\u205F\u3000]/g;
var BYTE_ORDER_MARK = /^\uFEFF/;
function tidyPasted(text) {
  return text.replace(BYTE_ORDER_MARK, "").replace(CURLY_DOUBLE, '"').replace(CURLY_SINGLE, "'").replace(ODD_SPACES, " ");
}

// ../../../../packages/ledger/src/read/read-ledger.ts
function readLedger(text) {
  const split = splitParts(tidyPasted(text));
  const ledger = { unreadable: [...split.outside], notReadYet: [] };
  if (split.spec !== void 0) {
    ledger.spec = split.spec;
  }
  const { graph, plan, done, summary } = split.parts;
  if (graph) {
    const reading = readGraph(graph);
    ledger.graph = reading.graph;
    setAside(ledger, "graph", reading.unread);
  }
  if (plan) {
    const reading = readPlan(plan);
    ledger.plan = reading.plan;
    setAside(ledger, "plan", reading.unread);
  }
  if (done) {
    const reading = readDone(done);
    ledger.done = reading.done;
    setAside(ledger, "done", reading.unread);
  }
  if (summary) {
    ledger.summary = summaryLines(summary);
  }
  return ledger;
}
function setAside(ledger, part, unread) {
  for (const numbered of unread) {
    const problem = { part, line: numbered.line, text: numbered.text.trim() };
    const word = notReadYetWord(part, numbered.text);
    if (word) {
      ledger.notReadYet.push({ ...problem, word });
    } else {
      ledger.unreadable.push(problem);
    }
  }
}
function summaryLines(lines) {
  const kept = [];
  for (const numbered of lines) {
    if (numbered.text.trim() !== "") {
      kept.push(numbered.text);
    }
  }
  return kept;
}

// ../../../../packages/ledger/src/week-range.ts
function weekRange(week, timeZone, now) {
  if (mondayOf(week) !== week) {
    return { ok: false, problem: `A week is named by its Monday: ${week} is not one` };
  }
  const from = midnightIn(week, timeZone);
  const nextMonday = midnightIn(addDays(week, 7), timeZone);
  if (from.getTime() > now.getTime()) {
    return { ok: false, problem: `The week of ${week} has not begun` };
  }
  const soFar = now.getTime() < nextMonday.getTime();
  const to = soFar ? now : nextMonday;
  return { ok: true, range: { week, from: from.toISOString(), to: to.toISOString(), soFar } };
}
function midnightIn(date, timeZone) {
  const asIfUtc = Date.parse(`${date}T00:00:00Z`);
  let moment = asIfUtc;
  for (let round = 0; round < 2; round += 1) {
    moment = asIfUtc - offsetMinutes(new Date(moment), timeZone) * 6e4;
  }
  return new Date(moment);
}
function offsetMinutes(moment, timeZone) {
  const name = new Intl.DateTimeFormat("en-US", { timeZone, timeZoneName: "longOffset" }).formatToParts(moment).find((part) => part.type === "timeZoneName")?.value;
  const match = /GMT([+-])(\d{2}):(\d{2})/.exec(name ?? "");
  if (!match) {
    return 0;
  }
  const minutes = Number(match[2]) * 60 + Number(match[3]);
  return match[1] === "-" ? -minutes : minutes;
}

// src/ask-posts.ts
var ACCEPT_VERSION = "v5.0";
async function askPosts(asked) {
  const since = dateOf(Date.parse(asked.from) - 90 * 864e5);
  const until = dateOf(Date.parse(asked.to) + 864e5);
  const filter = encodeURIComponent(`published_at:>='${since}'+published_at:<'${until}'`);
  const path = `/posts/?limit=all&filter=${filter}&include=email,tags&formats=plaintext`;
  const url = `${asked.address}/ghost/api/admin${path}`;
  let reply;
  try {
    reply = await fetch(url, { headers: { Authorization: `Ghost ${asked.token}`, "Accept-Version": ACCEPT_VERSION } });
  } catch {
    return { ok: false, problem: `Could not reach Ghost at ${asked.address}` };
  }
  if (!reply.ok) {
    return { ok: false, problem: `Ghost at ${asked.address} said ${reply.status} to /posts/` };
  }
  const body = await reply.json();
  return { ok: true, posts: body.posts ?? [] };
}
function dateOf(moment) {
  return new Date(moment).toISOString().slice(0, 10);
}

// src/describe-result.ts
function describeResult(ledger, range, timeZone, lines, siteCount) {
  const out = ["spec 1", `read: ${ledger}`, `week of ${range.week}: ${howMuchOfTheWeek(range, timeZone)}`, ""];
  if (siteCount === 0) {
    out.push("no fact in the graph comes from Ghost: no site to read");
  } else if (lines.length === 0) {
    out.push("nothing was sent or published this week");
  }
  for (const line of lines) {
    out.push(`Change: ${line}`);
  }
  if (lines.length > 0) {
    out.push("", "nothing written: to add them, save the Change lines in a file and run dfm-ledger:plan-change with it");
  }
  return {
    text: out.join("\n"),
    data: { spec: 1, read: ledger, ...range, timeZone, said: lines, changeLines: lines.map((line) => `Change: ${line}`) }
  };
}
function howMuchOfTheWeek(range, timeZone) {
  if (range.soFar) {
    return `so far (to now in ${timeZone})`;
  }
  return `the whole week (${timeZone})`;
}

// src/find-sites.ts
function findSites(facts, sites) {
  const result = { sites: [], problems: [] };
  const names = [...new Set(facts.flatMap((fact) => /^ghost (\S+)/.exec(fact.source)?.[1] ?? []))];
  for (const name of names) {
    const site = sites.find((each) => each.platform === "ghost" && each.business === name);
    if (!site || !site.keyName) {
      result.problems.push(`No Ghost line for ${name} in settings: run dfm-ghost:site-add for it`);
      continue;
    }
    result.sites.push({ name, address: site.address.replace(/\/+$/, ""), keyName: site.keyName });
  }
  return result;
}

// src/read-args.ts
var USAGE = "node dist/run.js --ledger <file> --settings <file> [--week <Monday>] [--json]";
var NAMED2 = ["--ledger", "--settings", "--week"];
var DATE2 = /^\d{4}-\d{2}-\d{2}$/;
function readArgs(args) {
  const named = {};
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    const value = args[index + 1];
    if (arg === "--json") {
      continue;
    }
    const hasValue = value !== void 0 && !value.startsWith("--");
    if (NAMED2.includes(arg) && hasValue) {
      named[arg] = value;
      index += 1;
      continue;
    }
    return { ok: false, problem: `Not understood: ${arg}. Use: ${USAGE}` };
  }
  if (!named["--ledger"] || !named["--settings"]) {
    return { ok: false, problem: `Name the ledger and the settings. Use: ${USAGE}` };
  }
  if (named["--week"] && !DATE2.test(named["--week"])) {
    return { ok: false, problem: `A week is its Monday, such as 2026-11-30: ${named["--week"]}` };
  }
  const asked = { ledger: named["--ledger"], settings: named["--settings"] };
  if (named["--week"]) {
    asked.week = named["--week"];
  }
  return { ok: true, args: asked };
}

// src/their-words.ts
var SHORT_FORMS = ["e.g.", "i.e.", "eg.", "ie.", "vs.", "cf."];
function theirWords(post) {
  const excerpt = post.custom_excerpt?.trim();
  if (excerpt) {
    return excerpt;
  }
  const text = String(post.plaintext ?? "").replace(/\s+/g, " ").trim();
  const sentences = sentencesOf(text);
  const words = sentences.length >= 2 ? `${sentences[0]} ${sentences[1]}` : text;
  return words.slice(0, 300);
}
function sentencesOf(text) {
  const sentences = [];
  let start = 0;
  for (const end of text.matchAll(/[.!?](?=\s|$)/g)) {
    const upTo = (end.index ?? 0) + 1;
    const sentence = text.slice(start, upTo).trim();
    if (endsWithShortForm(sentence)) {
      continue;
    }
    sentences.push(sentence);
    start = upTo;
  }
  return sentences;
}
function endsWithShortForm(sentence) {
  const lastWord = (sentence.split(" ").pop() ?? "").toLowerCase();
  return SHORT_FORMS.includes(lastWord);
}

// src/said-lines.ts
function saidLines(posts, groups, week, timeZone) {
  return posts.flatMap((post) => {
    const emailed = Boolean(post.email?.email_count) && inWeek(post.email?.created_at, week);
    const published = post.status === "published" && inWeek(post.published_at, week);
    if (!emailed && !published) {
      return [];
    }
    const how = howItWentOut(emailed, published);
    const on = dayIn(String(emailed ? post.email?.created_at : post.published_at), timeZone);
    const forWho = whoFor(post, groups);
    return [`${week.week} said ${how} on ${on}: "${post.title}" ${post.url} [${forWho.join(", ")}] summary: "${theirWords(post)}"`];
  });
}
function howItWentOut(emailed, published) {
  if (emailed && published) {
    return "by email and on the website";
  }
  return emailed ? "by email" : "on the website";
}
function whoFor(post, groups) {
  const slugs = (post.tags ?? []).map((tag2) => tag2.slug);
  const named = groups.filter((group) => slugs.includes(group.tag)).map((group) => group.name);
  return named.length > 0 ? named : ["everyone"];
}
function inWeek(moment, week) {
  if (!moment) {
    return false;
  }
  const at = Date.parse(moment);
  return at >= Date.parse(week.from) && at < Date.parse(week.to);
}
function dayIn(moment, timeZone) {
  return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(moment));
}

// src/run.ts
async function main(args) {
  const asked = readArgs(args);
  if (!asked.ok) {
    return failed(asked.problem);
  }
  const settings = parseSettings(await readText(asked.args.settings) ?? "");
  const timeZone = settings.settings.timeZone;
  if (settings.problems.length > 0 || !timeZone) {
    return failed(`Fix the settings first: ${settings.problems.join("; ") || "they cannot be read"}`);
  }
  const ledgerText = await readText(asked.args.ledger);
  if (ledgerText === void 0) {
    return failed(`Cannot read the ledger: ${asked.args.ledger}`);
  }
  const graph = readLedger(ledgerText).graph;
  const sites = findSites(graph?.facts ?? [], settings.settings.sites);
  if (sites.problems.length > 0) {
    return failed(sites.problems.join("\n"));
  }
  const now = /* @__PURE__ */ new Date();
  const range = weekRange(asked.args.week ?? mondayOf(nowIn(timeZone, now).today), timeZone, now);
  if (!range.ok) {
    return failed(range.problem);
  }
  const groups = tagGroups(graph?.groups ?? []);
  const said = await sayEachSite(sites.sites, groups, range.range, settings.settings, timeZone);
  if (!said.ok) {
    return failed(said.problem);
  }
  printOutput(describeResult(asked.args.ledger, range.range, timeZone, said.lines, sites.sites.length), outputMode(args));
  return EXIT_DONE;
}
function tagGroups(groups) {
  return groups.flatMap((group) => group.rule.kind === "tag" && group.rule.tag ? [{ name: group.name, tag: group.rule.tag }] : []);
}
async function sayEachSite(sites, groups, range, settings, timeZone) {
  const lines = [];
  for (const site of sites) {
    const token = await tokenFor(site, settings);
    if (!token.ok) {
      return token;
    }
    const answer = await askPosts({ address: site.address, token: token.token, from: range.from, to: range.to });
    if (!answer.ok) {
      return answer;
    }
    lines.push(...saidLines(answer.posts, groups, range, timeZone));
  }
  return { ok: true, lines };
}
async function tokenFor(site, settings) {
  if (!settings.keysFile) {
    return { ok: false, problem: "Name the keys file in settings first: keys file: ~/.config/dfm/.env" };
  }
  try {
    return { ok: true, token: await adminToken(await readKey(settings.keysFile, site.keyName)) };
  } catch (error) {
    const named = error instanceof Error && (error.name === "MissingKeyError" || error.name === "MalformedAdminKeyError");
    return { ok: false, problem: named ? error.message : `Cannot read ${site.keyName} from the keys file ${settings.keysFile}.` };
  }
}
function failed(problem) {
  process.stderr.write(`${problem}
`);
  return EXIT_REFUSED_OR_FAILED;
}
process.exitCode = await main(process.argv.slice(2));
