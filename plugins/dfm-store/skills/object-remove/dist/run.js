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

// ../../../../packages/store/src/version.ts
var NO_VERSION = "none";
async function versionOf(text) {
  if (text === void 0 || text === "") {
    return NO_VERSION;
  }
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return toHex(new Uint8Array(digest));
}
function toHex(bytes) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
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

// ../../../../packages/store/src/ghost/member-calls.ts
var ACCEPT_VERSION = "v6.0";
function headersFor(token, sending = false) {
  const headers = { Authorization: `Ghost ${token}`, "Accept-Version": ACCEPT_VERSION };
  if (sending) {
    headers["Content-Type"] = "application/json";
  }
  return headers;
}
function fieldsUrl(address) {
  return `${address}/ghost/api/admin/members/metafields/custom/`;
}
function membersByEmailUrl(address, email) {
  const filter = encodeURIComponent(`email:'${email.replace(/'/g, "\\'")}'`);
  return `${address}/ghost/api/admin/members/?filter=${filter}&include=metafields&limit=2`;
}
function memberUrl(address, id) {
  return `${address}/ghost/api/admin/members/${encodeURIComponent(id)}/?include=metafields`;
}
function changeBody(field, text) {
  return JSON.stringify({ members: [{ metafields: { custom: { [field]: text === "" ? null : text } } }] });
}
function fieldText(member, field) {
  const custom = member.metafields?.custom;
  const value = custom?.[field];
  return typeof value === "string" ? value : "";
}

// ../../../../packages/store/src/ghost/read-field.ts
async function readField(lookup, fetch) {
  const fields = await fieldsOnSite(lookup, fetch);
  if (!fields.ok) {
    return fields;
  }
  if (!fields.keys.includes(lookup.field)) {
    return { ok: false, problem: `The site has no member field called ${lookup.field}. Its fields: ${fields.keys.join(", ") || "none"}.` };
  }
  return oneMember(lookup, fetch);
}
async function fieldsOnSite(lookup, fetch) {
  const response = await fetch(fieldsUrl(lookup.address), { method: "GET", headers: headersFor(lookup.token) });
  if (response.status === 404 || response.status === 406) {
    return { ok: false, problem: `${lookup.address} has no member custom fields: they need a newer Ghost than this site runs.` };
  }
  if (!response.ok) {
    return { ok: false, problem: `Ghost answered ${response.status} when asked for its member fields.` };
  }
  const body = await response.json();
  return { ok: true, keys: (body.members_metafields ?? []).map((each) => each.key) };
}
async function oneMember(lookup, fetch) {
  const response = await fetch(membersByEmailUrl(lookup.address, lookup.email), { method: "GET", headers: headersFor(lookup.token) });
  if (!response.ok) {
    return { ok: false, problem: `Ghost answered ${response.status} when asked for the member ${lookup.email}.` };
  }
  const body = await response.json();
  const found = (body.members ?? []).filter((member) => member.email.toLowerCase() === lookup.email.toLowerCase());
  if (found.length === 0) {
    return { ok: false, problem: `No member on ${lookup.address} has the email ${lookup.email}.` };
  }
  if (found.length > 1) {
    return { ok: false, problem: `More than one member on ${lookup.address} has the email ${lookup.email}.` };
  }
  return { ok: true, memberId: found[0].id, text: fieldText(found[0], lookup.field) };
}

// ../../../../packages/store/src/ghost/write-field.ts
async function writeField(change, fetch) {
  const response = await fetch(memberUrl(change.address, change.memberId), {
    method: "PUT",
    headers: headersFor(change.token, true),
    body: changeBody(change.field, change.text)
  });
  if (!response.ok) {
    return { ok: false, problem: `Ghost answered ${response.status} to the change. Read the field again before trying once more.` };
  }
  const body = await response.json();
  const member = body.members?.[0];
  if (member === void 0) {
    return { ok: false, problem: "Ghost answered the change with no member." };
  }
  return { ok: true, saved: fieldText(member, change.field) };
}

// ../../../../packages/store/src/rest/answer-problem.ts
var MEANINGS = {
  400: "refused the request as malformed (400). Check the object's kind and id: the id is the business's name.",
  401: "refused the key (401). Check the key named in settings is the store's key.",
  403: "refused the key (403). Check the key named in settings is the store's key.",
  413: "refused the body as larger than it takes (413).",
  428: "asked for the version the change was read at (428)."
};
function answerProblem(address, doing, status) {
  const meaning = MEANINGS[status] ?? `answered ${status}.`;
  return `The store at ${address} ${meaning} It was asked to ${doing}.`;
}

// ../../../../packages/store/src/rest/rest-calls.ts
var LIMITS_PATH = "/limits";
function objectsUrl(address, kind) {
  return `${address}/objects/${encodeURIComponent(kind)}`;
}
function objectUrl(address, kind, id) {
  return `${objectsUrl(address, kind)}/${encodeURIComponent(id)}`;
}
function limitsUrl(address) {
  return `${address}${LIMITS_PATH}`;
}
function headersFor2(key, sending = false, ifMatch) {
  const headers = { Authorization: `Bearer ${key}`, Accept: "application/json" };
  if (sending) {
    headers["Content-Type"] = "application/json";
  }
  if (ifMatch !== void 0) {
    headers["If-Match"] = ifMatch;
  }
  return headers;
}

// ../../../../packages/store/src/rest/read-rest.ts
async function readRest(lookup, fetch) {
  const object = await readOne(lookup, fetch);
  if (!object.ok) {
    return object;
  }
  const limit = await readLimit(lookup, fetch);
  if (!limit.ok) {
    return limit;
  }
  return { ok: true, text: object.text, version: object.version, limit: limit.bytes };
}
async function readOne(lookup, fetch) {
  const doing = `read the ${lookup.kind} ${lookup.id}`;
  const response = await fetch(objectUrl(lookup.address, lookup.kind, lookup.id), { method: "GET", headers: headersFor2(lookup.key) });
  if (response.status === 404) {
    return { ok: true, text: "", version: NO_VERSION };
  }
  if (!response.ok) {
    return { ok: false, problem: answerProblem(lookup.address, doing, response.status) };
  }
  const body = await response.json();
  if (typeof body.version !== "string" || body.version === "" || typeof body.body !== "string") {
    return { ok: false, problem: `The store at ${lookup.address} answered without a version and a body. It was asked to ${doing}.` };
  }
  return { ok: true, text: body.body, version: body.version };
}
async function readLimit(lookup, fetch) {
  const doing = "give its limit";
  const response = await fetch(limitsUrl(lookup.address), { method: "GET", headers: headersFor2(lookup.key) });
  if (!response.ok) {
    return { ok: false, problem: answerProblem(lookup.address, doing, response.status) };
  }
  const body = await response.json();
  if (typeof body.bytes !== "number" || !Number.isInteger(body.bytes) || body.bytes <= 0) {
    return { ok: false, problem: `The store at ${lookup.address} gave no limit in bytes. It was asked to ${doing}.` };
  }
  return { ok: true, bytes: body.bytes };
}

// ../../../../packages/store/src/rest/write-rest.ts
async function writeRest(change, fetch) {
  if (change.readAt === NO_VERSION) {
    return add(change, fetch);
  }
  return changeAt(change, fetch);
}
async function add(change, fetch) {
  const response = await fetch(objectsUrl(change.address, change.kind), {
    method: "POST",
    headers: headersFor2(change.key, true),
    body: JSON.stringify({ id: change.id, body: change.text })
  });
  return answered(change, `add the ${change.kind} ${change.id}`, response, [409]);
}
async function changeAt(change, fetch) {
  const response = await fetch(objectUrl(change.address, change.kind, change.id), {
    method: "PUT",
    headers: headersFor2(change.key, true, change.readAt),
    body: JSON.stringify({ body: change.text })
  });
  return answered(change, `change the ${change.kind} ${change.id}`, response, [404, 409]);
}
async function answered(change, doing, response, movedWhen) {
  if (movedWhen.includes(response.status)) {
    return { ok: false, moved: true };
  }
  if (!response.ok) {
    return { ok: false, moved: false, problem: answerProblem(change.address, doing, response.status) };
  }
  const body = await response.json();
  if (typeof body.version !== "string" || body.version === "") {
    return { ok: false, moved: false, problem: `The store at ${change.address} answered without a new version. It was asked to ${doing}.` };
  }
  return { ok: true, version: body.version };
}

// ../../../../packages/store/src/write/decide-write.ts
var GHOST_FIELD_LIMIT = 65535;

// ../../../../packages/store/src/write/line-changes.ts
function lineChanges(before, after) {
  const old = linesOf(before);
  const next = linesOf(after);
  const kept = keptTable(old, next);
  const lines = [];
  let i = 0;
  let j = 0;
  while (i < old.length || j < next.length) {
    if (i < old.length && j < next.length && old[i] === next[j]) {
      i += 1;
      j += 1;
    } else if (j < next.length && (i === old.length || kept[i][j + 1] > kept[i + 1][j])) {
      lines.push(`+ ${next[j]}`);
      j += 1;
    } else {
      lines.push(`- ${old[i]}`);
      i += 1;
    }
  }
  return { lines, out: lines.filter((line) => line.startsWith("- ")).length, in: lines.filter((line) => line.startsWith("+ ")).length };
}
function linesOf(text) {
  const trimmed = text.trimEnd();
  return trimmed === "" ? [] : trimmed.split(/\r?\n/);
}
function keptTable(old, next) {
  const kept = Array.from({ length: old.length + 1 }, () => new Array(next.length + 1).fill(0));
  for (let i = old.length - 1; i >= 0; i -= 1) {
    for (let j = next.length - 1; j >= 0; j -= 1) {
      kept[i][j] = old[i] === next[j] ? kept[i + 1][j + 1] + 1 : Math.max(kept[i + 1][j], kept[i][j + 1]);
    }
  }
  return kept;
}

// ../../../../packages/store/src/write/backup-name.ts
function backupName(object, business, timeZone, now = /* @__PURE__ */ new Date()) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23"
    }).formatToParts(now).map((part) => [part.type, part.value])
  );
  return `${object}-${business}-${parts.year}-${parts.month}-${parts.day}-${parts.hour}${parts.minute}${parts.second}.txt`;
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

// ../../../../packages/store/src/node/object-file.ts
import { mkdir, readFile as readFile3, rm, writeFile } from "node:fs/promises";
import { dirname as dirname2, resolve } from "node:path";
function objectPath(path, workingFolder = process.cwd()) {
  return resolve(workingFolder, expandHome(path));
}
async function readObjectFile(path) {
  try {
    return await readFile3(path, "utf8");
  } catch (error) {
    if (error.code === "ENOENT") {
      return void 0;
    }
    throw error;
  }
}
async function writeObjectFile(path, text) {
  await mkdir(dirname2(path), { recursive: true });
  await writeFile(path, text, "utf8");
}
async function removeObjectFile(path) {
  await rm(path, { force: true });
}

// ../../../../packages/store/src/node/backup.ts
import { mkdir as mkdir2, writeFile as writeFile2 } from "node:fs/promises";
import { dirname as dirname3, join as join3, resolve as resolve2 } from "node:path";
function backupsFolder(settingsPath, backupsLine) {
  const settingsFolder = dirname3(resolve2(expandHome(settingsPath)));
  if (backupsLine === void 0) {
    return join3(settingsFolder, "backups");
  }
  return resolve2(settingsFolder, expandHome(backupsLine));
}
async function writeBackup(folder, name, text) {
  await mkdir2(folder, { recursive: true, mode: 448 });
  for (let copy = 1; copy < 100; copy += 1) {
    const path = join3(folder, copy === 1 ? name : name.replace(/\.txt$/, `-${copy}.txt`));
    try {
      await writeFile2(path, text, { encoding: "utf8", flag: "wx", mode: 384 });
      return path;
    } catch (error) {
      if (error.code !== "EEXIST") {
        throw error;
      }
    }
  }
  throw new Error(`Too many backups named ${name} in ${folder}.`);
}

// ../../../../packages/store/src/rest/remove-rest.ts
async function removeRest(removal, fetch) {
  const response = await fetch(objectUrl(removal.address, removal.kind, removal.id), {
    method: "DELETE",
    headers: headersFor2(removal.key, false, removal.readAt)
  });
  if (response.status === 404 || response.status === 409) {
    return { ok: false, moved: true };
  }
  if (!response.ok) {
    return { ok: false, moved: false, problem: answerProblem(removal.address, `remove the ${removal.kind} ${removal.id}`, response.status) };
  }
  return { ok: true };
}

// ../../../../packages/store/src/node/store-object.ts
async function readObject(place, fetch = globalThis.fetch) {
  if (place.connector === "file") {
    return readFile4(place.path);
  }
  if (place.connector === "ghost") {
    return readGhostField(place, fetch);
  }
  return readRestObject(place, fetch);
}
async function writeObject(place, found, text, fetch = globalThis.fetch) {
  if (found.connector === "file") {
    await writeObjectFile(found.path, text);
    return { ok: true };
  }
  if (found.connector === "ghost") {
    return writeGhostField(place, found, text, fetch);
  }
  return writeRestObject(place, found, text, fetch);
}
async function readFile4(placePath) {
  const path = objectPath(placePath);
  const text = await readObjectFile(path) ?? "";
  return { ok: true, text, version: await versionOf(text), limit: void 0, found: { connector: "file", path } };
}
async function removeObject(place, found, fetch = globalThis.fetch) {
  if (found.connector === "file") {
    await removeObjectFile(found.path);
    return { ok: true };
  }
  if (found.connector === "rest") {
    return removeRestObject(place, found, fetch);
  }
  return writeObject(place, found, "", fetch);
}
async function removeRestObject(place, found, fetch) {
  const removal = { address: place.address, kind: place.kind, id: place.id, key: found.key, readAt: found.version };
  const removed = await removeRest(removal, fetch);
  if (removed.ok) {
    return { ok: true };
  }
  if (removed.moved) {
    return { ok: false, moved: true, problem: `The ${place.kind} ${place.id} changed in the store since it was read. Nothing was removed.` };
  }
  return { ok: false, moved: false, problem: removed.problem };
}
async function readGhostField(place, fetch) {
  const token = await tokenFor(place);
  if (!token.ok) {
    return token;
  }
  const lookup = { address: place.site.address, email: place.email, field: place.field, token: token.token };
  const read = await readField(lookup, fetch);
  if (!read.ok) {
    return read;
  }
  const found = { connector: "ghost", memberId: read.memberId, token: token.token };
  return { ok: true, text: read.text, version: await versionOf(read.text), limit: GHOST_FIELD_LIMIT, found };
}
async function writeGhostField(place, found, text, fetch) {
  const change = { address: place.site.address, memberId: found.memberId, field: place.field, text, token: found.token };
  const written = await writeField(change, fetch);
  return written.ok ? { ok: true } : { ok: false, moved: false, problem: written.problem };
}
async function readRestObject(place, fetch) {
  const key = await keyFor(place.keysFile, place.keyName);
  if (!key.ok) {
    return key;
  }
  const read = await readRest({ address: place.address, kind: place.kind, id: place.id, key: key.key }, fetch);
  if (!read.ok) {
    return read;
  }
  const found = { connector: "rest", key: key.key, version: read.version };
  return { ok: true, text: read.text, version: read.version, limit: read.limit, found };
}
async function writeRestObject(place, found, text, fetch) {
  const change = { address: place.address, kind: place.kind, id: place.id, key: found.key, readAt: found.version, text };
  const written = await writeRest(change, fetch);
  if (written.ok) {
    return { ok: true };
  }
  if (written.moved) {
    return { ok: false, moved: true, problem: `The ${place.kind} ${place.id} changed in the store since it was read. Nothing was written.` };
  }
  return { ok: false, moved: false, problem: written.problem };
}
async function tokenFor(place) {
  const key = await keyFor(place.keysFile, place.site.keyName);
  if (!key.ok) {
    return key;
  }
  try {
    return { ok: true, token: await adminToken(key.key) };
  } catch (error) {
    if (error instanceof Error && error.name === "MalformedAdminKeyError") {
      return { ok: false, problem: error.message };
    }
    return { ok: false, problem: `Cannot read ${place.site.keyName} from the keys file ${place.keysFile}.` };
  }
}
async function keyFor(keysFile, keyName) {
  try {
    return { ok: true, key: await readKey(keysFile, keyName) };
  } catch (error) {
    if (error instanceof Error && error.name === "MissingKeyError") {
      return { ok: false, problem: error.message };
    }
    return { ok: false, problem: `Cannot read ${keyName} from the keys file ${keysFile}.` };
  }
}

// src/decide-remove.ts
function decideRemove(check) {
  if (check.current.version === NO_VERSION) {
    return { kind: "nothing to remove" };
  }
  if (check.current.version !== check.seenVersion) {
    return { kind: "moved", now: check.current.text };
  }
  return { kind: "remove" };
}

// src/describe-remove.ts
function describePreview(shown, before, version) {
  const changes = lineChanges(before, "");
  const lines = [
    `${shown.object} of ${shown.business}`,
    `where: ${shown.where}`,
    `version: ${version}`,
    `would take out all ${changes.out} lines, leaving it empty:`,
    "",
    ...changes.lines,
    "",
    "A copy goes into the backups folder first.",
    "Nothing is removed yet. To remove it, run the same command with:",
    `--go --version ${version}`
  ];
  return { text: lines.join("\n"), data: { ...shown, version, changes: changes.lines, out: changes.out } };
}
function describeMoved(shown, now, version) {
  const lines = [
    `${shown.object} of ${shown.business} changed since it was read. Nothing was removed.`,
    `where: ${shown.where}`,
    `version now: ${version}`,
    "As it is now:",
    "",
    ...now.trimEnd().split(/\r?\n/),
    "",
    "Preview again to remove it as it is now."
  ];
  return { text: lines.join("\n"), data: { ...shown, moved: true, version, now } };
}
function describeNothing(shown) {
  const text = `${shown.object} of ${shown.business}: nothing to remove, it is empty.
where: ${shown.where}
version: none`;
  return { text, data: { ...shown, version: "none", nothing: true } };
}
function describeRemoved(shown, backup) {
  const lines = [
    `${shown.object} of ${shown.business} removed and read back: it is empty.`,
    `where: ${shown.where}`,
    "version: none",
    `backup: ${backup}`
  ];
  return { text: lines.join("\n"), data: { ...shown, version: "none", backup } };
}
function describeStillThere(shown, version, lines) {
  const text = `${shown.object} of ${shown.business} is still there (${lines} lines).
where: ${shown.where}
version: ${version}`;
  return { text, data: { ...shown, version, stillThere: true, lines } };
}

// src/run.ts
var SKILL = "dfm-store:object-remove";
var USAGE = "node dist/run.js --object <kind> --business <name> --settings <file> [--preview | --go --version <version> | --read-back] [--run-log <file>] [--json]";
var FLAGS = {
  valueFlags: ["--object", "--business", "--settings", "--version", "--run-log"],
  required: ["--object", "--business", "--settings"],
  usage: USAGE
};
async function main(args) {
  const output = outputMode(args);
  const mode = writeMode(args);
  if (!mode.ok) {
    return failed([mode.problem]);
  }
  const flags = readFlags(args, FLAGS);
  if (!flags.ok) {
    return failed([flags.problem]);
  }
  const asked = askedFrom(flags.values);
  if (mode.mode === "go" && !asked.version) {
    return failed(["--go needs the version the preview showed: --go --version <version>."]);
  }
  const read = await readSettings(asked.settings);
  const place = findPlace(read, asked.object, asked.business);
  if (!place.ok) {
    return failed(place.problems);
  }
  const shown = { object: asked.object, business: asked.business, where: place.place.label };
  const current = await readObject(place.place);
  if (!current.ok) {
    return failed([current.problem]);
  }
  if (mode.mode === "read-back") {
    return readBack(shown, current, output);
  }
  if (mode.mode === "preview") {
    return preview(shown, current, output);
  }
  return remove(asked, read.settings, shown, place.place, current, output);
}
function askedFrom(values) {
  return {
    object: values["--object"],
    business: values["--business"],
    settings: values["--settings"],
    version: values["--version"],
    runLog: values["--run-log"]
  };
}
function preview(shown, current, output) {
  if (current.version === NO_VERSION) {
    printOutput(describeNothing(shown), output);
    return EXIT_DONE;
  }
  printOutput(describePreview(shown, current.text, current.version), output);
  return EXIT_DONE;
}
async function remove(asked, settings, shown, place, current, output) {
  const decision = decideRemove({ seenVersion: asked.version ?? "", current });
  if (decision.kind === "nothing to remove") {
    printOutput(describeNothing(shown), output);
    return EXIT_DONE;
  }
  if (decision.kind === "moved") {
    printOutput(describeMoved(shown, decision.now, current.version), output);
    return EXIT_REFUSED_OR_FAILED;
  }
  const backup = await backUp(asked, settings, current.text);
  const removed = await removeObject(place, current.found);
  if (!removed.ok) {
    return failed([removed.problem, backupLine(backup)]);
  }
  const after = await readObject(place);
  const afterVersion = after.ok ? after.version : "unread";
  await appendRunLine(runLogPath(asked.settings, asked.runLog), {
    when: /* @__PURE__ */ new Date(),
    skill: SKILL,
    what: `${asked.object} ${asked.business} removed`,
    where: place.label,
    before: `version ${current.version} backup ${backup}`,
    after: `version ${afterVersion}`
  });
  if (!after.ok) {
    return failed([after.problem, backupLine(backup)]);
  }
  if (after.version !== NO_VERSION) {
    return failed(["The object is still there after the remove.", backupLine(backup)]);
  }
  printOutput(describeRemoved(shown, backup), output);
  return EXIT_DONE;
}
async function backUp(asked, settings, text) {
  const folder = backupsFolder(asked.settings, settings.backups);
  const name = backupName(asked.object, asked.business, settings.timeZone ?? "UTC");
  return writeBackup(folder, name, text);
}
function backupLine(backup) {
  return `The object as it was is in ${backup}.`;
}
function readBack(shown, current, output) {
  if (current.version === NO_VERSION) {
    printOutput(describeNothing(shown), output);
    return EXIT_DONE;
  }
  const lines = current.text.trimEnd().split("\n").length;
  printOutput(describeStillThere(shown, current.version, lines), output);
  return EXIT_PROBLEMS_FOUND;
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
