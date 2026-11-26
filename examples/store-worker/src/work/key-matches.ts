// Compares the key sent with the store's key in constant time.
// Both are hashed first. The comparison takes the same time
// whatever the keys' lengths and wherever they first differ.

async function sha256(text: string): Promise<ArrayBuffer> {
  const bytes = new TextEncoder().encode(text);
  return crypto.subtle.digest("SHA-256", bytes);
}

export async function keyMatches(sent: string, expected: string): Promise<boolean> {
  const sentHash = await sha256(sent);
  const expectedHash = await sha256(expected);
  return crypto.subtle.timingSafeEqual(sentHash, expectedHash);
}
