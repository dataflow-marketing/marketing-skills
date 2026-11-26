// Takes the key out of an "Authorization: Bearer <key>" header.
// Gives back null when there is no header or it is not a Bearer key.

const BEARER = /^Bearer\s+(\S+)\s*$/i;

export function bearerKey(authorization: string | undefined): string | null {
  if (authorization === undefined) {
    return null;
  }
  const match = BEARER.exec(authorization);
  if (match === null) {
    return null;
  }
  return match[1] ?? null;
}
