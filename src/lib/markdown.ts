import { slugify } from "@/lib/utils";

export type MarkdownHeading = {
  id: string;
  text: string;
  level: 2 | 3;
};

function cleanHeadingText(text: string) {
  return text
    .replace(/[`*_~[\]()]/g, "")
    .replace(/<[^>]+>/g, "")
    .trim();
}

export function createHeadingIdFactory() {
  const counts = new Map<string, number>();

  return (text: string) => {
    const base = slugify(cleanHeadingText(text)) || "section";
    const count = counts.get(base) ?? 0;
    counts.set(base, count + 1);
    return count === 0 ? base : `${base}-${count + 1}`;
  };
}

export function extractMarkdownHeadings(markdown: string) {
  const getId = createHeadingIdFactory();
  const headings: MarkdownHeading[] = [];
  let isCodeBlock = false;

  for (const line of markdown.split(/\r?\n/)) {
    if (line.trim().startsWith("```")) {
      isCodeBlock = !isCodeBlock;
      continue;
    }
    if (isCodeBlock) continue;

    const match = /^(##|###)\s+(.+)$/.exec(line.trim());
    if (!match) continue;

    const text = cleanHeadingText(match[2]);
    if (!text) continue;

    headings.push({
      id: getId(text),
      text,
      level: match[1] === "##" ? 2 : 3
    });
  }

  return headings;
}
