// Built by pnpm build from its src folder. Do not edit: change the source and build again.

// ../../../../packages/core/src/settings/read-line.ts
var SITE_LINE = /^site ([a-z0-9-]+): (\S+) (\S+)(?: key in (\S+))?$/;
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
    site.keyName = match[4];
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
  { name: "house rule", addTo: addHouseRule }
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
    houseRules: []
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

// ../../../../packages/core/src/node/read-settings.ts
import { readFile } from "node:fs/promises";
async function readSettings(settingsPath) {
  const text = await readFile(expandHome(settingsPath), "utf8");
  return parseSettings(text);
}

// ../../../../packages/core/src/node/read-key.ts
import { readFile as readFile2 } from "node:fs/promises";
async function readKey(keysFilePath, keyName) {
  const text = await readFile2(expandHome(keysFilePath), "utf8");
  const keys = parseKeysFile(text);
  return findKey(keys, keyName);
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

// src/check-read-back.ts
function checkReadBack(post, expected) {
  const problems = [];
  const isDraft = post.status === "draft";
  if (!isDraft) {
    problems.push(`FAILED: Ghost says the post is ${post.status}, not a draft. Open it in Ghost now and set it back to draft.`);
  }
  if (post.title !== expected.title) {
    problems.push(`The title on Ghost is "${post.title}", not "${expected.title}".`);
  }
  if (post.slug === "") {
    problems.push("The post on Ghost has no slug.");
  }
  if (expected.slug && post.slug !== expected.slug) {
    problems.push(`The slug on Ghost is ${post.slug}, not ${expected.slug}: another post may have it already.`);
  }
  return { isDraft, problems };
}

// src/describe-preview.ts
function describePreview(request, site) {
  const authorization = `Ghost (a 5 minute token made at send time from the key in ${site.keyName})`;
  const lines = [];
  lines.push("preview: nothing sent");
  lines.push(`site: ${site.business} ${site.address}`);
  lines.push(`would send: ${request.method} ${request.url}`);
  for (const [name, value] of Object.entries(request.headers)) {
    lines.push(`${name}: ${value}`);
  }
  lines.push(`Authorization: ${authorization}`);
  lines.push("status: not sent; Ghost makes a new post a draft");
  lines.push("");
  lines.push(request.body);
  const data = {
    mode: "preview",
    site: site.business,
    method: request.method,
    url: request.url,
    headers: { ...request.headers, Authorization: authorization },
    body: JSON.parse(request.body)
  };
  return { text: lines.join("\n"), data };
}

// src/admin-api.ts
var ACCEPT_VERSION = "v5.0";
function postsUrl(address) {
  return `${address}/ghost/api/admin/posts/?source=html`;
}
function postUrl(address, id) {
  return `${address}/ghost/api/admin/posts/${encodeURIComponent(id)}/`;
}
function editorUrl(address, id) {
  return `${address}/ghost/#/editor/post/${encodeURIComponent(id)}`;
}

// src/describe-result.ts
function describeResult(site, post, check, created) {
  const lines = [];
  if (created) {
    lines.push(`created on ${site.business}: id ${post.id} (status was not sent)`);
  }
  lines.push(`read back: status ${post.status}, title "${post.title}", slug ${post.slug}`);
  if (check.problems.length === 0) {
    lines.push("read back: passed");
  } else {
    lines.push(`read back: ${check.problems.length} problems`);
    lines.push(...check.problems);
  }
  lines.push(`open it in Ghost: ${editorUrl(site.address, post.id)}`);
  lines.push("a person reads it and publishes it: no skill does");
  const data = { site: site.business, created, post, isDraft: check.isDraft, problems: check.problems };
  return { text: lines.join("\n"), data };
}

// src/body-html.ts
function bodyHtml(paragraphs) {
  const blocks = [];
  for (const paragraph of paragraphs) {
    const lines = paragraph.split(/\r?\n/).map((line) => escapeHtml(line.trim()));
    blocks.push(`<p>${lines.join("<br>")}</p>`);
  }
  return blocks.join("\n");
}
function escapeHtml(text) {
  return text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

// src/slug-from-link.ts
var SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
function slugFromLink(link, address) {
  if (!link || !link.startsWith(`${address}/`)) {
    return void 0;
  }
  const rest = link.slice(address.length);
  const parts = rest.split("/").filter((part) => part !== "");
  const last = parts[parts.length - 1];
  if (!last || !SLUG.test(last)) {
    return void 0;
  }
  return last;
}

// src/draft-request.ts
function draftRequest(words, site) {
  const post = newPost(words, site);
  return {
    method: "POST",
    url: postsUrl(site.address),
    headers: {
      "Content-Type": "application/json",
      "Accept-Version": ACCEPT_VERSION
    },
    body: JSON.stringify({ posts: [post] }, null, 2)
  };
}
function expectedPost(words, site) {
  const expected = { title: words.title ?? "" };
  const slug = slugFromLink(words.link, site.address);
  if (slug) {
    expected.slug = slug;
  }
  return expected;
}
function newPost(words, site) {
  const post = {
    title: words.title ?? "",
    html: bodyHtml(words.paragraphs)
  };
  if (words.excerpt) {
    post.custom_excerpt = words.excerpt;
  }
  if (words.tags.length > 0) {
    post.tags = words.tags.map((name) => ({ name }));
  }
  const slug = slugFromLink(words.link, site.address);
  if (slug) {
    post.slug = slug;
  }
  return post;
}

// src/find-ghost-site.ts
function findGhostSite(read, name) {
  if (read.problems.length > 0) {
    return { ok: false, problems: read.problems.map((problem) => `settings ${problem}`) };
  }
  const site = read.settings.sites.find((known) => known.business === name && known.platform === "ghost");
  if (!site) {
    return { ok: false, problems: [`Settings have no Ghost site called ${name}. Add it with dfm-ghost:site-add.`] };
  }
  if (!site.keyName) {
    return { ok: false, problems: [`The Ghost site ${name} names no key in settings. Add it again with dfm-ghost:site-add.`] };
  }
  if (!site.address.startsWith("https://")) {
    return { ok: false, problems: [`The address for ${name} is not https://: ${site.address}`] };
  }
  if (!read.settings.keysFile) {
    return { ok: false, problems: ["Settings name no keys file. Add a line such as: keys file: ~/.config/dfm/.env"] };
  }
  return { ok: true, found: { site: { ...site, keyName: site.keyName }, keysFile: read.settings.keysFile } };
}

// src/node/read-inputs.ts
import { readFile as readFile3, stat } from "node:fs/promises";
async function readInputs(wordsPath, reportPath) {
  const wordsText = await readOne(wordsPath);
  if (wordsText === void 0) {
    return { ok: false, problem: `Cannot read the words file: ${wordsPath}` };
  }
  if (reportPath === void 0) {
    return { ok: true, inputs: { wordsText, reportIsNewer: false } };
  }
  const reportText = await readOne(reportPath);
  if (reportText === void 0) {
    return { ok: false, problem: `Cannot read the check report: ${reportPath}` };
  }
  const reportIsNewer = await isNewer(reportPath, wordsPath);
  return { ok: true, inputs: { wordsText, reportText, reportIsNewer } };
}
async function readOne(path) {
  try {
    return await readFile3(expandHome(path), "utf8");
  } catch {
    return void 0;
  }
}
async function isNewer(reportPath, wordsPath) {
  const report = await stat(expandHome(reportPath));
  const words = await stat(expandHome(wordsPath));
  return report.mtimeMs >= words.mtimeMs;
}

// src/node/read-token.ts
async function readToken(found) {
  try {
    const key = await readKey(found.keysFile, found.site.keyName);
    return { ok: true, token: await adminToken(key) };
  } catch (error) {
    return { ok: false, problem: safeMessage(error, found) };
  }
}
function safeMessage(error, found) {
  if (error instanceof Error && (error.name === "MissingKeyError" || error.name === "MalformedAdminKeyError")) {
    return error.message;
  }
  return `Cannot read ${found.site.keyName} from the keys file ${found.keysFile}.`;
}

// src/read-args.ts
var USAGE = "node dist/run.js --words <file> --report <file> --site <name> --settings <file> [--preview | --go | --read-back --id <post id>] [--run-log <file>] [--json]";
var VALUE_FLAGS = ["--words", "--report", "--site", "--settings", "--id", "--run-log"];
function readArgs(args, mode) {
  const values = {};
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    const value = args[index + 1];
    if (arg === "--json" || isModeFlag(arg)) {
      continue;
    }
    if (VALUE_FLAGS.includes(arg) && isValue(value)) {
      values[arg] = value;
      index += 1;
      continue;
    }
    return { ok: false, problem: `Not understood: ${arg}. Use: ${USAGE}` };
  }
  const words = values["--words"];
  const site = values["--site"];
  const settings = values["--settings"];
  if (!words || !site || !settings) {
    return { ok: false, problem: `Name the words file, the site and the settings file. Use: ${USAGE}` };
  }
  if (mode !== "read-back" && !values["--report"]) {
    return { ok: false, problem: `Name the quotes-check report for the words file with --report. Use: ${USAGE}` };
  }
  if (mode === "read-back" && !values["--id"]) {
    return { ok: false, problem: `Name the post to read back with --id, as --go printed it. Use: ${USAGE}` };
  }
  return { ok: true, args: withOptional({ words, site, settings }, values) };
}
function withOptional(read, values) {
  if (values["--report"]) {
    read.report = values["--report"];
  }
  if (values["--id"]) {
    read.id = values["--id"];
  }
  if (values["--run-log"]) {
    read.runLog = values["--run-log"];
  }
  return read;
}
function isValue(value) {
  return value !== void 0 && !value.startsWith("--");
}

// src/post-from-response.ts
async function postFromResponse(response) {
  const answer = await readAnswer(response);
  if (!response.ok) {
    return { ok: false, problem: `Ghost answered ${response.status}: ${errorMessage(answer)}` };
  }
  const post = answer?.posts?.[0];
  if (!post || !isText(post.id) || !isText(post.status) || !isText(post.title) || !isText(post.slug)) {
    return { ok: false, problem: "Ghost's answer has no post with an id, status, title and slug." };
  }
  return { ok: true, post: { id: post.id, status: post.status, title: post.title, slug: post.slug } };
}
async function readAnswer(response) {
  try {
    return await response.json();
  } catch {
    return void 0;
  }
}
function errorMessage(answer) {
  const message2 = answer?.errors?.[0]?.message;
  if (isText(message2)) {
    return message2;
  }
  return "no message";
}
function isText(value) {
  return typeof value === "string";
}

// src/read-post.ts
async function readPost(address, id, token, send) {
  const url = postUrl(address, id);
  let response;
  try {
    response = await send(url, {
      method: "GET",
      headers: { "Accept-Version": ACCEPT_VERSION, Authorization: `Ghost ${token}` }
    });
  } catch {
    return { ok: false, problem: `Could not reach Ghost at ${url}` };
  }
  return postFromResponse(response);
}

// src/read-report.ts
function readReport(text) {
  const lines = text.split(/\r?\n/);
  const report = { against: [] };
  const first = lines[0]?.trim();
  if (first) {
    report.spec = first;
  }
  for (const rawLine of lines.slice(1)) {
    const line = rawLine.trim();
    if (line === "") {
      break;
    }
    readHeaderLine(line, report);
  }
  return report;
}
function readHeaderLine(line, report) {
  const checked = valueAfter("checked:", line);
  if (checked) {
    report.checked = checked;
  }
  const against = valueAfter("against:", line);
  if (against) {
    report.against.push(against);
  }
  const result = valueAfter("result:", line);
  if (result) {
    report.result = result;
  }
}
function valueAfter(prefix, line) {
  if (!line.startsWith(prefix)) {
    return void 0;
  }
  const value = line.slice(prefix.length).trim();
  if (value === "") {
    return void 0;
  }
  return value;
}

// src/read-words.ts
var SPEC_LINE2 = "spec 1";
var BODY_MARKER = "=== body ===";
var FIELD_LINE = /^([a-z]+): (.*)$/;
var FIELDS = ["kind", "state", "title", "excerpt", "channel", "topic", "for", "ask", "campaign", "link", "from", "tags"];
var REQUIRED = ["kind", "state", "channel", "from"];
var KINDS = ["post", "email", "share", "message"];
var STATES = ["idea", "draft", "approved", "published"];
function readWords(text) {
  const lines = text.split(/\r?\n/);
  const problems = [];
  if (lines[0]?.trim() !== SPEC_LINE2) {
    problems.push(`line 1: expected "${SPEC_LINE2}"`);
  }
  const bodyAt = lines.findIndex((line) => line.trim() === BODY_MARKER);
  if (bodyAt < 0) {
    problems.push(`no "${BODY_MARKER}" line`);
    return { ok: false, problems };
  }
  const fields = readFields(lines.slice(1, bodyAt), problems);
  checkFields(fields, problems);
  if (problems.length > 0) {
    return { ok: false, problems };
  }
  const paragraphs = readParagraphs(lines.slice(bodyAt + 1).join("\n"));
  return { ok: true, words: toWords(fields, paragraphs) };
}
function readFields(header, problems) {
  const fields = {};
  header.forEach((rawLine, index) => {
    const line = rawLine.trim();
    if (line === "") {
      return;
    }
    const match = FIELD_LINE.exec(line);
    if (!match || !FIELDS.includes(match[1])) {
      problems.push(`line ${index + 2}: not understood: ${line}`);
      return;
    }
    fields[match[1]] = match[2].trim();
  });
  return fields;
}
function checkFields(fields, problems) {
  for (const field of REQUIRED) {
    if (!fields[field]) {
      problems.push(`no ${field}: it is required`);
    }
  }
  if (fields.kind && !KINDS.includes(fields.kind)) {
    problems.push(`kind ${fields.kind} is not one of ${KINDS.join(", ")}`);
  }
  if (fields.state && !STATES.includes(fields.state)) {
    problems.push(`state ${fields.state} is not one of ${STATES.join(", ")}`);
  }
  const needsTitle = fields.kind === "post" || fields.kind === "email";
  if (needsTitle && !fields.title) {
    problems.push(`no title: a ${fields.kind} needs one`);
  }
}
function readParagraphs(body) {
  const paragraphs = [];
  for (const block of body.split(/\n\s*\n/)) {
    const paragraph = block.trim();
    if (paragraph !== "") {
      paragraphs.push(paragraph);
    }
  }
  return paragraphs;
}
function readTags(tags) {
  if (!tags) {
    return [];
  }
  const names = [];
  for (const tag2 of tags.split(",")) {
    const name = tag2.trim();
    if (name !== "") {
      names.push(name);
    }
  }
  return names;
}
function toWords(fields, paragraphs) {
  const words = {
    kind: fields.kind,
    state: fields.state,
    channel: fields.channel,
    from: fields.from,
    tags: readTags(fields.tags),
    paragraphs
  };
  if (fields.title) {
    words.title = fields.title;
  }
  if (fields.excerpt) {
    words.excerpt = fields.excerpt;
  }
  if (fields.link) {
    words.link = fields.link;
  }
  return words;
}

// src/ready-to-draft.ts
var READY_STATES = ["draft", "approved"];
var GHOST_EXCERPT_LIMIT = 300;
function readyToDraft(words) {
  const problems = [];
  if (words.kind !== "post") {
    problems.push(`kind is ${words.kind}: post-draft puts a post on Ghost, nothing else`);
  }
  if (!READY_STATES.includes(words.state)) {
    problems.push(`state is ${words.state}: only a draft or approved words file goes to Ghost`);
  }
  if (words.paragraphs.length === 0) {
    problems.push("the body is empty");
  }
  if (words.excerpt && words.excerpt.length > GHOST_EXCERPT_LIMIT) {
    problems.push(`the excerpt is ${words.excerpt.length} characters: Ghost takes ${GHOST_EXCERPT_LIMIT} at most`);
  }
  return problems;
}

// src/same-path.ts
function samePath(first, second) {
  const a = withoutDotSlash(first);
  const b = withoutDotSlash(second);
  if (a === b) {
    return true;
  }
  return a.endsWith(`/${b}`) || b.endsWith(`/${a}`);
}
function withoutDotSlash(path) {
  let tidy = path.trim();
  while (tidy.startsWith("./")) {
    tidy = tidy.slice(2);
  }
  return tidy;
}

// src/report-passed.ts
var AGAIN = "Run dfm-content:quotes-check again.";
function reportPassed(report, wordsFor) {
  const problems = [];
  if (report.spec !== "spec 1") {
    problems.push("The report is not a check report: it does not start with spec 1.");
    return problems;
  }
  if (report.result !== "passed") {
    problems.push(`The check report says: ${report.result ?? "no result"}. A draft with problems goes nowhere: remove what was not found. ${AGAIN}`);
  }
  if (!report.checked || !samePath(report.checked, wordsFor.wordsPath)) {
    problems.push(`The check report is for ${report.checked ?? "no file"}, not ${wordsFor.wordsPath}.`);
  }
  if (!checkedAgainst(report, wordsFor.from)) {
    problems.push(`The check report was not checked against ${wordsFor.from}, the source named in the words file. ${AGAIN}`);
  }
  if (!wordsFor.reportIsNewer) {
    problems.push(`The words file changed after the check. ${AGAIN}`);
  }
  return problems;
}
function checkedAgainst(report, from) {
  for (const source of report.against) {
    if (samePath(source, from)) {
      return true;
    }
  }
  return false;
}

// src/names-a-status.ts
function namesAStatus(body) {
  let parsed;
  try {
    parsed = JSON.parse(body);
  } catch {
    return true;
  }
  const posts = postsIn(parsed);
  if (!posts) {
    return true;
  }
  for (const post of posts) {
    if (typeof post !== "object" || post === null || "status" in post) {
      return true;
    }
  }
  return false;
}
function postsIn(parsed) {
  if (typeof parsed !== "object" || parsed === null || !("posts" in parsed)) {
    return void 0;
  }
  const posts = parsed.posts;
  if (!Array.isArray(posts)) {
    return void 0;
  }
  return posts;
}

// src/send-draft.ts
async function sendDraft(request, token, send) {
  if (namesAStatus(request.body)) {
    return { ok: false, problem: "Refused: the request names a status. A skill never sets one: Ghost makes a new post a draft." };
  }
  let response;
  try {
    response = await send(request.url, {
      method: request.method,
      headers: { ...request.headers, Authorization: `Ghost ${token}` },
      body: request.body
    });
  } catch {
    return { ok: false, problem: `Could not reach Ghost at ${request.url}` };
  }
  return postFromResponse(response);
}

// src/run.ts
var SKILL = "dfm-ghost:post-draft";
async function main(args) {
  const output = outputMode(args);
  const mode = writeMode(args);
  if (!mode.ok) {
    return failed([mode.problem]);
  }
  const asked = readArgs(args, mode.mode);
  if (!asked.ok) {
    return failed([asked.problem]);
  }
  const read = await readInputs(asked.args.words, asked.args.report);
  if (!read.ok) {
    return failed([read.problem]);
  }
  const words = readWords(read.inputs.wordsText);
  if (!words.ok) {
    return failed(words.problems.map((problem) => `words file ${problem}`));
  }
  if (mode.mode !== "read-back") {
    const refusals = checkBeforeSending(words.words, read.inputs, asked.args.words);
    if (refusals.length > 0) {
      return failed(refusals);
    }
  }
  const settings = await readSettings(asked.args.settings);
  const ghost = findGhostSite(settings, asked.args.site);
  if (!ghost.ok) {
    return failed(ghost.problems);
  }
  const request = draftRequest(words.words, ghost.found.site);
  const expected = expectedPost(words.words, ghost.found.site);
  if (mode.mode === "preview") {
    printOutput(describePreview(request, ghost.found.site), output);
    return EXIT_DONE;
  }
  const token = await readToken(ghost.found);
  if (!token.ok) {
    return failed([token.problem]);
  }
  if (mode.mode === "read-back") {
    return readBack(ghost.found, asked.args.id ?? "", expected, token.token, output);
  }
  return sendAndReadBack(asked.args, ghost.found, request, expected, token.token, output);
}
function checkBeforeSending(words, inputs, wordsPath) {
  const notReady = readyToDraft(words);
  const report = readReport(inputs.reportText ?? "");
  const notChecked = reportPassed(report, { wordsPath, from: words.from, reportIsNewer: inputs.reportIsNewer });
  return [...notReady, ...notChecked];
}
async function sendAndReadBack(asked, ghost, request, expected, token, output) {
  const created = await sendDraft(request, token, fetch);
  if (!created.ok) {
    return failed([created.problem]);
  }
  await appendRunLine(runLogPath(asked.settings, asked.runLog), {
    when: /* @__PURE__ */ new Date(),
    skill: SKILL,
    what: "post draft",
    where: `ghost ${ghost.site.business} ${ghost.site.address}`,
    before: "",
    after: `${created.post.status} "${created.post.title}" id ${created.post.id} slug ${created.post.slug}`
  });
  const slug = expected.slug ?? created.post.slug;
  const readBackCode = await readBack(ghost, created.post.id, { ...expected, slug }, token, output, true);
  if (readBackCode !== EXIT_DONE) {
    return EXIT_REFUSED_OR_FAILED;
  }
  return EXIT_DONE;
}
async function readBack(ghost, id, expected, token, output, created = false) {
  const post = await readPost(ghost.site.address, id, token, fetch);
  if (!post.ok) {
    return failed([post.problem]);
  }
  const check = checkReadBack(post.post, expected);
  printOutput(describeResult(ghost.site, post.post, check, created), output);
  if (!check.isDraft) {
    return failed(check.problems);
  }
  if (check.problems.length > 0) {
    return EXIT_PROBLEMS_FOUND;
  }
  return EXIT_DONE;
}
function failed(problems) {
  process.stderr.write(`${problems.join("\n")}
`);
  return EXIT_REFUSED_OR_FAILED;
}
async function runSafely(args) {
  try {
    return await main(args);
  } catch (error) {
    const message2 = error instanceof Error ? error.message : "an unknown error";
    return failed([`Failed: ${message2}`]);
  }
}
process.exitCode = await runSafely(process.argv.slice(2));
