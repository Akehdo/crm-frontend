export function parseRecordTracks(value: string): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const track of value.split(/[\n,;]+/)) {
    const trimmed = track.trim();
    if (!trimmed || seen.has(trimmed)) {
      continue;
    }

    seen.add(trimmed);
    result.push(trimmed);
  }

  return result;
}
