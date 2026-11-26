// The calls the rest connector makes (spec/store.md, the REST contract): where they go and their headers.
// The key goes in the Authorization header only.

export const LIMITS_PATH = "/limits";

export function objectsUrl(address: string, kind: string): string {
  return `${address}/objects/${encodeURIComponent(kind)}`;
}

export function objectUrl(address: string, kind: string, id: string): string {
  return `${objectsUrl(address, kind)}/${encodeURIComponent(id)}`;
}

export function limitsUrl(address: string): string {
  return `${address}${LIMITS_PATH}`;
}

// ifMatch is the version a change or remove was read at
export function headersFor(key: string, sending = false, ifMatch?: string): Record<string, string> {
  const headers: Record<string, string> = { Authorization: `Bearer ${key}`, Accept: "application/json" };
  if (sending) {
    headers["Content-Type"] = "application/json";
  }
  if (ifMatch !== undefined) {
    headers["If-Match"] = ifMatch;
  }
  return headers;
}
