"use client";

import { ImageInsertControl } from "@/components/image-insert-control";

type HtmlImageUploaderProps = {
  targetId: string;
  helperText?: string;
};

export function HtmlImageUploader({ targetId, helperText }: HtmlImageUploaderProps) {
  return <ImageInsertControl targetId={targetId} mode="html" helperText={helperText} />;
}
