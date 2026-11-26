// A fake Ghost Admin API for members, for tests: a fetch that answers like Ghost for one made up site and refuses
// any other address. Nothing leaves the machine.
//
// It keeps its members, the site's custom fields and every request it is given.
// oldGhost makes it answer like a Ghost with no member custom fields (6.58 and before): the fields list is not found.

import type { Fetch } from "../src/ghost/member-calls.ts";

export type FakeMember = { id: string; email: string; custom: Record<string, string | null> };

export type SeenRequest = { method: string; url: string; headers: Record<string, string>; body?: string };

export type FakeGhostMembers = {
  fetch: Fetch;
  requests: SeenRequest[];
  members: FakeMember[];
  fields: string[];
};

export type FakeOptions = { address?: string; members?: FakeMember[]; fields?: string[]; oldGhost?: boolean };

const TOKEN_HEADER = /^Ghost [^.\s]+\.[^.\s]+\.[^.\s]+$/;

export function fakeGhostMembers(options: FakeOptions = {}): FakeGhostMembers {
  const api = `${options.address ?? "https://coffee-shop.example"}/ghost/api/admin/members/`;
  const state = { members: options.members ?? [], fields: options.fields ?? ["next"] };
  const requests: SeenRequest[] = [];

  const fetch: Fetch = async (url, init) => {
    const seen = seeRequest(url, init);
    requests.push(seen);
    if (!url.startsWith(api)) {
      throw new Error(`fake Ghost: refused a request to ${url}`);
    }
    if (!TOKEN_HEADER.test(seen.headers.Authorization ?? "")) {
      return answer(401, { errors: [{ message: "Authorization failed" }] });
    }
    const rest = url.slice(api.length);
    if (rest.startsWith("metafields/custom/")) {
      return options.oldGhost ? answer(404, { errors: [{ message: "Resource not found" }] }) : fieldsList(state.fields);
    }
    if (rest.startsWith("?")) {
      return byEmail(rest, state.members);
    }
    return oneMember(rest, seen, state.members);
  };

  return { fetch, requests, get members() { return state.members; }, get fields() { return state.fields; } };
}

function fieldsList(fields: string[]): Response {
  return answer(200, { members_metafields: fields.map((key) => ({ key, name: key, type: "text" })) });
}

function byEmail(query: string, members: FakeMember[]): Response {
  const filter = new URLSearchParams(query.slice(1)).get("filter") ?? "";
  const email = /^email:'(.*)'$/.exec(filter)?.[1]?.replace(/\\'/g, "'") ?? "";
  const found = members.filter((member) => member.email.toLowerCase() === email.toLowerCase()).slice(0, 2);
  return answer(200, { members: found.map(asGhost) });
}

function oneMember(rest: string, seen: SeenRequest, members: FakeMember[]): Response {
  const id = decodeURIComponent(rest.split("/")[0]);
  const member = members.find((each) => each.id === id);
  if (!member) {
    return answer(404, { errors: [{ message: "Member not found." }] });
  }
  if (seen.method === "PUT") {
    const sent = JSON.parse(seen.body ?? "{}").members[0].metafields.custom as Record<string, string | null>;
    Object.assign(member.custom, sent);
  }
  return answer(200, { members: [asGhost(member)] });
}

function asGhost(member: FakeMember): unknown {
  return { id: member.id, email: member.email, metafields: { custom: { ...member.custom } } };
}

function seeRequest(url: string, init: RequestInit): SeenRequest {
  const headers: Record<string, string> = {};
  for (const [name, value] of Object.entries(init.headers ?? {})) {
    headers[name] = String(value);
  }
  const seen: SeenRequest = { method: init.method ?? "GET", url, headers };
  if (typeof init.body === "string") {
    seen.body = init.body;
  }
  return seen;
}

function answer(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}
