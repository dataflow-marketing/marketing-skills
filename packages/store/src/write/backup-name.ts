// The name of a backup: <kind>-<business>-<date>-<time>.txt, the date and time in the settings time zone,
// to the second. The Node edge adds -2, -3 when a name is already taken.

export function backupName(object: string, business: string, timeZone: string, now: Date = new Date()): string {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(now)
      .map((part) => [part.type, part.value]),
  );
  return `${object}-${business}-${parts.year}-${parts.month}-${parts.day}-${parts.hour}${parts.minute}${parts.second}.txt`;
}
