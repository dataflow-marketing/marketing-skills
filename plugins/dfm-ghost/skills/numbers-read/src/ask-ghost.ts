// Asks a Ghost site's Admin API, read only, for what numbers-read counts: every member's address and when they
// joined; the posts that may have gone out as an email in the week, with their email numbers.
// Web standard fetch only: it runs in a Worker too.

export const ACCEPT_VERSION = "v5.0";

export type Member = { email: string; createdAt: string };

export type Email = { sentAt: string; sent: number; opens: number; clicks: number };

export type Asked = { address: string; token: string; from: string; to: string };

export type GhostAnswer = { ok: true; members: Member[]; emails: Email[] } | { ok: false; problem: string };

type Fetched = { ok: true; body: any } | { ok: false; problem: string };

export async function askGhost(asked: Asked): Promise<GhostAnswer> {
  const members = await everyMember(asked);
  if (!members.ok) {
    return members;
  }
  const emails = await emailsAround(asked);
  if (!emails.ok) {
    return emails;
  }
  return { ok: true, members: members.members, emails: emails.emails };
}

// every member, a page of 100 at a time
async function everyMember(asked: Asked): Promise<{ ok: true; members: Member[] } | { ok: false; problem: string }> {
  const members: Member[] = [];
  for (let page = 1; ; page += 1) {
    const fetched = await adminGet(asked, `/members/?limit=100&page=${page}`);
    if (!fetched.ok) {
      return fetched;
    }
    for (const member of fetched.body.members ?? []) {
      members.push({ email: String(member.email ?? "").toLowerCase(), createdAt: String(member.created_at ?? "") });
    }
    if (!fetched.body.meta?.pagination?.next) {
      return { ok: true, members };
    }
  }
}

// An email counts in the week it was sent, whatever date its post carries: a post published up to 90 days before
// the week can be sent in it. No fields= here: with it Ghost leaves out count.clicks and every email reads 0 clicks.
async function emailsAround(asked: Asked): Promise<{ ok: true; emails: Email[] } | { ok: false; problem: string }> {
  const since = dateOf(Date.parse(asked.from) - 90 * 86_400_000);
  const until = dateOf(Date.parse(asked.to) + 86_400_000);
  const filter = encodeURIComponent(`published_at:>='${since}'+published_at:<'${until}'`);
  const fetched = await adminGet(asked, `/posts/?limit=all&filter=${filter}&include=email,count.clicks`);
  if (!fetched.ok) {
    return fetched;
  }
  const withEmail = (fetched.body.posts ?? []).filter((post: any) => post.email && post.email.email_count);
  return { ok: true, emails: withEmail.map(toEmail) };
}

function toEmail(post: any): Email {
  return {
    sentAt: String(post.email.created_at ?? ""),
    sent: Number(post.email.delivered_count ?? post.email.email_count ?? 0),
    opens: Number(post.email.opened_count ?? 0),
    clicks: Number(post.count?.clicks ?? 0),
  };
}

async function adminGet(asked: Asked, path: string): Promise<Fetched> {
  const url = `${asked.address}/ghost/api/admin${path}`;
  let reply: Response;
  try {
    reply = await fetch(url, { headers: { Authorization: `Ghost ${asked.token}`, "Accept-Version": ACCEPT_VERSION } });
  } catch {
    return { ok: false, problem: `Could not reach Ghost at ${asked.address}` };
  }
  if (!reply.ok) {
    return { ok: false, problem: `Ghost at ${asked.address} said ${reply.status} to ${path.split("?")[0]}` };
  }
  return { ok: true, body: await reply.json() };
}

function dateOf(moment: number): string {
  return new Date(moment).toISOString().slice(0, 10);
}
