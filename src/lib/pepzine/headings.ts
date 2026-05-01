export interface Heading {
  level: 2 | 3;
  text: string;
  id: string;
}

export function toSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/ş/g, "s")
    .replace(/ç/g, "c")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ö/g, "o")
    .replace(/ı/g, "i")
    .replace(/İ/g, "i")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function parseHeadings(source: string): Heading[] {
  const headings: Heading[] = [];
  let inCodeBlock = false;

  for (const line of source.split("\n")) {
    if (line.startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;

    const h2 = line.match(/^## (.+)$/);
    const h3 = line.match(/^### (.+)$/);

    if (h2) {
      const text = h2[1].trim();
      headings.push({ level: 2, text, id: toSlug(text) });
    } else if (h3) {
      const text = h3[1].trim();
      headings.push({ level: 3, text, id: toSlug(text) });
    }
  }

  return headings;
}
