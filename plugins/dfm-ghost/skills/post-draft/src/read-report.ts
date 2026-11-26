// Reads a check report in the shape of spec/check-report.md: its spec line,
// what it checked, what against and its result. The lines after are for a person.

export type CheckReport = {
  spec?: string;
  checked?: string;
  against: string[];
  result?: string;
};

export function readReport(text: string): CheckReport {
  const lines = text.split(/\r?\n/);
  const report: CheckReport = { against: [] };

  const first = lines[0]?.trim();
  if (first) {
    report.spec = first;
  }

  for (const rawLine of lines.slice(1)) {
    const line = rawLine.trim();
    if (line === "") {
      break;
    }
    readHeaderLine(line, report);
  }
  return report;
}

function readHeaderLine(line: string, report: CheckReport): void {
  const checked = valueAfter("checked:", line);
  if (checked) {
    report.checked = checked;
  }
  const against = valueAfter("against:", line);
  if (against) {
    report.against.push(against);
  }
  const result = valueAfter("result:", line);
  if (result) {
    report.result = result;
  }
}

function valueAfter(prefix: string, line: string): string | undefined {
  if (!line.startsWith(prefix)) {
    return undefined;
  }
  const value = line.slice(prefix.length).trim();
  if (value === "") {
    return undefined;
  }
  return value;
}
