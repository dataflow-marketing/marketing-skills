// Today and the time now in a time zone (web standard: it runs in a Worker too), as the done lines write them: 2026-12-02 and 2026-12-02T10:00+11:00.

export function nowIn(timeZone: string, now: Date = new Date()): { today: string; stamp: string } {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
      timeZoneName: "longOffset",
    })
      .formatToParts(now)
      .map((part) => [part.type, part.value]),
  );
  const today = `${parts.year}-${parts.month}-${parts.day}`;
  const offset = String(parts.timeZoneName).replace("GMT", "") || "+00:00";
  return { today, stamp: `${today}T${parts.hour}:${parts.minute}${offset}` };
}
