// A text file imported with ?raw comes in as a string.

declare module "*?raw" {
  const text: string;
  export default text;
}
