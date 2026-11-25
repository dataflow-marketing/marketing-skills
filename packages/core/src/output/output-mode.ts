// Every script prints plain text for a person or JSON for another script with --json.

export type OutputMode = "text" | "json";

export function outputMode(args: readonly string[]): OutputMode {
  if (args.includes("--json")) {
    return "json";
  }
  return "text";
}
