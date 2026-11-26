// Reads the largest body the store takes from the MAX_BODY_BYTES variable.
// A missing or broken value is an error in the Worker's setup. It fails loudly.

export function sizeLimit(maxBodyBytes: string | undefined): number {
  const bytes = Number(maxBodyBytes);
  if (!Number.isInteger(bytes) || bytes <= 0) {
    throw new Error("MAX_BODY_BYTES must be a whole number of bytes above 0");
  }
  return bytes;
}
