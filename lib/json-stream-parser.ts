/**
 * Extracts individual JSON objects from a raw concatenated stream string.
 *
 * Many streaming APIs (e.g. OpenAI Responses API) emit events as
 * back-to-back JSON objects without delimiters:
 *   {"type":"response.created",...}{"type":"response.output_text.delta","delta":"Hi"}
 *
 * This parser walks the string character by character, tracks brace depth
 * and string escaping, and yields each top-level `{…}` slice as a parsed
 * object. Malformed chunks are silently skipped.
 */
export function extractJsonObjectsFromStream(raw: string): unknown[] {
  const events: unknown[] = [];
  let depth = 0;
  let startIndex = -1;
  let isInsideString = false;
  let isEscaped = false;

  for (let i = 0; i < raw.length; i++) {
    const currentCharacter = raw[i];

    if (isInsideString) {
      if (isEscaped) {
        isEscaped = false;
        continue;
      }
      if (currentCharacter === '\\') {
        isEscaped = true;
        continue;
      }
      if (currentCharacter === '"') {
        isInsideString = false;
      }
      continue;
    }

    if (currentCharacter === '"') {
      isInsideString = true;
      continue;
    }

    if (currentCharacter === '{') {
      if (depth === 0) {
        startIndex = i;
      }
      depth += 1;
      continue;
    }

    if (currentCharacter === '}') {
      depth -= 1;
      if (depth === 0 && startIndex >= 0) {
        const eventAsString = raw.slice(startIndex, i + 1);
        try {
          events.push(JSON.parse(eventAsString) as unknown);
        } catch {
          // Ignore malformed chunks and continue parsing the stream.
        }
        startIndex = -1;
      }
    }
  }

  return events;
}
