function slugifyMarkdownHeading(text: string): string {
  return text
    .replace(/<[^>]+>/g, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

/**
 * Trailing explicit heading ids: `Title [#id]` (DevHub), or the `{#id}` /
 * MDX-escaped `\{#id\}` form the gt CLI appends to translated headings so
 * anchors keep pointing at the English slugs.
 */
const EXPLICIT_HEADING_ID =
  /\s*(?:\\\{#([^}\\]+)\\\}|\{#([^}]+)\}|\[#([^\]]+)\])\s*$/;

export function splitExplicitHeadingId(text: string): {
  id: string | null;
  text: string;
} {
  const match = EXPLICIT_HEADING_ID.exec(text);
  if (!match) {
    return { id: null, text };
  }
  return {
    id: match[1] ?? match[2] ?? match[3] ?? null,
    text: text.slice(0, match.index).trimEnd(),
  };
}

export function getMarkdownHeadingId(
  text: string,
  usedIds: Map<string, number>,
): { id: string; text: string } {
  const explicit = splitExplicitHeadingId(text);
  if (explicit.id) {
    usedIds.set(explicit.id, (usedIds.get(explicit.id) ?? 0) + 1);
    return { id: explicit.id, text: explicit.text };
  }
  return { id: getUniqueMarkdownHeadingId(text, usedIds), text };
}

function getUniqueMarkdownHeadingId(
  text: string,
  usedIds: Map<string, number>,
): string {
  const baseId = slugifyMarkdownHeading(text);
  const nextIndex = usedIds.get(baseId) ?? 0;
  usedIds.set(baseId, nextIndex + 1);

  if (nextIndex === 0) {
    return baseId;
  }

  return `${baseId}-${nextIndex}`;
}
