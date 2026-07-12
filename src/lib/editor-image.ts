export type TextSelection = {
  value: string;
  cursor: number;
};

function imageAltText(fileName?: string) {
  return (fileName || "圖片")
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[\r\n[\]"<>]/g, " ")
    .replace(/\s+/g, " ")
    .trim() || "圖片";
}

function escapeHtmlAttribute(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function createMarkdownImageSnippet(url: string, fileName?: string) {
  return `![${imageAltText(fileName)}](${url})`;
}

export function createHtmlImageSnippet(url: string, fileName?: string) {
  return `<img src="${escapeHtmlAttribute(url)}" alt="${escapeHtmlAttribute(imageAltText(fileName))}" class="figure-image" style="display:block;max-width:100%;height:auto;margin:1.5rem auto;" />`;
}

export function insertBlockAtSelection(
  value: string,
  selectionStart: number,
  selectionEnd: number,
  snippet: string,
): TextSelection {
  const before = value.slice(0, selectionStart);
  const after = value.slice(selectionEnd);
  const prefix = before.length === 0 || before.endsWith("\n\n") ? "" : before.endsWith("\n") ? "\n" : "\n\n";
  const suffix = after.length === 0 || after.startsWith("\n\n") ? "" : after.startsWith("\n") ? "\n" : "\n\n";
  const inserted = `${prefix}${snippet}${suffix}`;

  return {
    value: `${before}${inserted}${after}`,
    cursor: before.length + inserted.length,
  };
}
