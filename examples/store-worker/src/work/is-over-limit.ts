// Tells whether a body is larger than the store's limit.
// The limit is in bytes of UTF-8, not characters: "caf\u00e9" (cafe with an accent) is 5 bytes.

export function bodyBytes(body: string): number {
  return new TextEncoder().encode(body).byteLength;
}

export function isOverLimit(body: string, limit: number): boolean {
  return bodyBytes(body) > limit;
}
