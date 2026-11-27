// An address on this computer: http://localhost or http://127.0.0.1, with any port. A site, a store or a demo served
// on the person's own machine is read the same way as a real one; everywhere else an address must be https.

export function isLocalAddress(url: URL): boolean {
  return url.protocol === "http:" && (url.hostname === "localhost" || url.hostname === "127.0.0.1");
}
