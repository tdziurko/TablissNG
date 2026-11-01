import { Loader } from "../../types";
import { BookQuote, Data } from "./types";

// Collapse whitespace, e.g. line breaks left over from a CSV conversion
function asText(value: unknown) {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
}

/**
 * Accepts an array of objects with the quote in `text` (or `quote`/`content`),
 * and optional `author`, `book` and `tags` fields. Invalid entries are skipped.
 */
export function parseQuotes(body: unknown): BookQuote[] {
  if (!Array.isArray(body)) return [];

  return body.flatMap((entry) => {
    if (!entry || typeof entry !== "object") return [];

    const record = entry as Record<string, unknown>;
    const text =
      asText(record.text) || asText(record.quote) || asText(record.content);
    if (!text) return [];

    return [
      {
        text,
        author: asText(record.author) || undefined,
        book: asText(record.book) || undefined,
        tags: asTags(record.tags) || undefined,
      },
    ];
  });
}

// Tags may be a string ("#a #b") or an array of strings
function asTags(value: unknown) {
  if (Array.isArray(value)) return value.map(asText).filter(Boolean).join(" ");
  return asText(value);
}

function shuffled<T>(items: T[]) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export async function fetchQuotes(
  { url, shuffle }: Pick<Data, "url" | "shuffle">,
  loader: Loader,
): Promise<BookQuote[]> {
  if (!url.trim()) return [];

  loader.push();
  try {
    const response = await fetch(url.trim());
    if (!response.ok) return [];

    const quotes = parseQuotes(await response.json());
    return shuffle ? shuffled(quotes) : quotes;
  } catch {
    return [];
  } finally {
    loader.pop();
  }
}
