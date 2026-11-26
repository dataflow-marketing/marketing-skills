// Reads one public address as text. The fetch is given in: tests never reach the network.

export type Fetch = (url: string, init: RequestInit) => Promise<Response>;

export type FetchedText = { ok: true; text: string } | { ok: false; status?: number; problem: string };

export async function fetchText(url: string, send: Fetch): Promise<FetchedText> {
  let response: Response;
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
