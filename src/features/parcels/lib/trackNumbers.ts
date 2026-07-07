export function parseTracks(value: string): string[] {
  return value
    .split(/[\n,;]+/)
    .map((track) => track.trim())
    .filter(Boolean);
}
