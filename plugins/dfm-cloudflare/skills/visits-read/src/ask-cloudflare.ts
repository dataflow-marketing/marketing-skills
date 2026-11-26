// Asks Cloudflare Web Analytics (its GraphQL API) for one site's page views in a range, grouped by the site they
// came from. Read only: the token needs Account > Account Analytics > Read.
// Ghost's admin (/ghost/...) and draft previews (/p/...) are never visitors and are always left out.
// Web standard fetch only: it runs in a Worker too.

export const CLOUDFLARE_GRAPHQL = "https://api.cloudflare.com/client/v4/graphql";

export type Row = { views: number; visits: number; refererHost: string; sampleInterval: number };

export type Asked = { account: string; token: string; host: string; from: string; to: string };

export type AskResult = { ok: true; rows: Row[] } | { ok: false; problem: string };

const QUERY = `query($account: string!, $from: Time!, $to: Time!, $hosts: [string!]) {
  viewer { accounts(filter: { accountTag: $account }) {
    rumPageloadEventsAdaptiveGroups(limit: 5000, filter: {
      datetime_geq: $from
      datetime_lt: $to
      requestHost_in: $hosts
      AND: [{ requestPath_notlike: "/ghost/%" } { requestPath_notlike: "/p/%" }]
    }) {
      count
      sum { visits }
      avg { sampleInterval }
      dimensions { refererHost }
    }
  } }
}`;

type Group = { count: number; sum: { visits: number }; avg: { sampleInterval: number }; dimensions: { refererHost: string } };
type Answer = { data?: { viewer?: { accounts?: { rumPageloadEventsAdaptiveGroups: Group[] }[] } }; errors?: { message: string }[] };

export async function askCloudflare(asked: Asked): Promise<AskResult> {
  const reply = await fetch(CLOUDFLARE_GRAPHQL, {
    method: "POST",
    headers: { Authorization: `Bearer ${asked.token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query: QUERY, variables: variablesFor(asked) }),
  });
  const answer = (await reply.json().catch(() => ({}))) as Answer;

  if (!reply.ok || answer.errors?.length) {
    return { ok: false, problem: `Cloudflare said ${reply.status}: ${whatCloudflareSaid(answer)}` };
  }
  const account = answer.data?.viewer?.accounts?.[0];
  if (!account) {
    return { ok: false, problem: `No account came back for ${asked.host}: check the account id in settings and that the token has Account Analytics Read on it` };
  }
  return { ok: true, rows: account.rumPageloadEventsAdaptiveGroups.map(toRow) };
}

function variablesFor(asked: Asked) {
  return { account: asked.account, from: asked.from, to: asked.to, hosts: [asked.host, `www.${asked.host}`] };
}

function toRow(group: Group): Row {
  return {
    views: group.count,
    visits: group.sum.visits,
    refererHost: group.dimensions.refererHost,
    sampleInterval: group.avg.sampleInterval,
  };
}

// Cloudflare's own words, never the token
function whatCloudflareSaid(answer: Answer): string {
  const messages = (answer.errors ?? []).map((each) => each.message);
  return messages.join("; ") || "no answer that could be read";
}
