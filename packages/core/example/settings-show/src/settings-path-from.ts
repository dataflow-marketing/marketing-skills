// The settings file is the first argument that is not a flag.

export function settingsPathFrom(args: readonly string[]): string | undefined {
  for (const arg of args) {
    if (!arg.startsWith("--")) {
      return arg;
    }
  }
  return undefined;
}
