import assert from "node:assert/strict";
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
