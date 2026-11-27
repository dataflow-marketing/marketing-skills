// Adds up one Ghost site's week: new members (the person's own addresses left out) and the emails sent in it.
// A moment counts when it is from the week's start up to, not including, its end.

import type { Email, Member } from "./ask-ghost.ts";
import type { Measure } from "./facts-to-read.ts";

export type Numbers = Record<Measure, number>;

export type Week = { from: string; to: string };

export function addUp(members: readonly Member[], emails: readonly Email[], week: Week, ownEmails: readonly string[]): Numbers {
  const joined = members.filter((member) => inWeek(member.createdAt, week) && !ownEmails.includes(member.email));
  const sent = emails.filter((email) => inWeek(email.sentAt, week));

  return {
    "new members": joined.length,
    "paid plans": members.filter((member) => member.paidStarts.some((start) => inWeek(start, week))).length,
    emails: sent.length,
    "emails sent": total(sent, (email) => email.sent),
    "email opens": total(sent, (email) => email.opens),
    "email clicks": total(sent, (email) => email.clicks),
  };
}

// the week's email numbers for the emails whose post carries a tag: the group that tag names
export function emailsFor(tag: string, emails: readonly Email[]): Email[] {
  return emails.filter((email) => email.tags.includes(tag));
}

function inWeek(moment: string, week: Week): boolean {
  const at = Date.parse(moment);
  return at >= Date.parse(week.from) && at < Date.parse(week.to);
}

function total(emails: readonly Email[], numberOf: (email: Email) => number): number {
  return emails.reduce((sum, email) => sum + numberOf(email), 0);
}
