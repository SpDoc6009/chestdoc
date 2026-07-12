"use client";

import { ImageInsertControl } from "@/components/image-insert-control";

type MarkdownEditorEnhancerProps = {
  targetId: string;
  helperText?: string;
};

export function MarkdownEditorEnhancer({ targetId, helperText }: MarkdownEditorEnhancerProps) {
  return <ImageInsertControl targetId={targetId} mode="markdown" helperText={helperText} />;
}
