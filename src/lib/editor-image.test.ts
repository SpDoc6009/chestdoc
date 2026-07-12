import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  createHtmlImageSnippet,
  createMarkdownImageSnippet,
  insertBlockAtSelection,
// @ts-expect-error Node's type-stripping test runner requires the explicit TypeScript extension.
} from "./editor-image.ts";

test("creates a Markdown image with a safe alt label", () => {
  assert.equal(
    createMarkdownImageSnippet("https://example.com/lung.png", "lung [figure].png"),
    "![lung figure](https://example.com/lung.png)",
  );
});

test("creates a responsive HTML image", () => {
  assert.equal(
    createHtmlImageSnippet("https://example.com/lung.png", 'lung "figure".png'),
    '<img src="https://example.com/lung.png" alt="lung figure" class="figure-image" style="display:block;max-width:100%;height:auto;margin:1.5rem auto;" />',
  );
});

test("inserts an image block at the current selection", () => {
  assert.deepEqual(insertBlockAtSelection("before\nafter", 7, 7, "![lung](url)"), {
    value: "before\n\n![lung](url)\n\nafter",
    cursor: 22,
  });
});

for (const pagePath of [
  "../app/admin/articles/new/page.tsx",
  "../app/admin/articles/[id]/edit/page.tsx",
]) {
  test(`places HTML before Markdown in ${pagePath}`, async () => {
    const source = await readFile(new URL(pagePath, import.meta.url), "utf8");
    const htmlPosition = source.indexOf('<Label htmlFor="htmlContent">');
    const markdownPosition = source.indexOf('<Label htmlFor="content">');

    assert.notEqual(htmlPosition, -1);
    assert.notEqual(markdownPosition, -1);
    assert.ok(htmlPosition < markdownPosition, "HTML editor must appear before the Markdown editor");
  });
}
