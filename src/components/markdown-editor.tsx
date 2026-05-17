"use client";

import * as React from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type MarkdownEditorProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  helperText?: string;
};

type UploadResponse = {
  url?: string;
  fileName?: string;
  error?: string;
};

export function MarkdownEditor({ className, helperText, onPaste, onDrop, ...props }: MarkdownEditorProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);

  async function readUploadResponse(response: Response) {
    const text = await response.text();
    if (!text) return {} as UploadResponse;

    try {
      return JSON.parse(text) as UploadResponse;
    } catch {
      return { error: text.slice(0, 160) };
    }
  }

  function insertAtCursor(markdown: string) {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = textarea.value.slice(0, start);
    const after = textarea.value.slice(end);
    const prefix = before.length === 0 || before.endsWith("\n\n") ? "" : before.endsWith("\n") ? "\n" : "\n\n";
    const suffix = after.length === 0 || after.startsWith("\n\n") ? "" : after.startsWith("\n") ? "\n" : "\n\n";
    const inserted = `${prefix}${markdown}${suffix}`;

    textarea.value = `${before}${inserted}${after}`;
    textarea.focus();
    const cursor = before.length + inserted.length;
    textarea.setSelectionRange(cursor, cursor);
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
  }

  function imageAltText(fileName?: string) {
    return (fileName || "圖片").replace(/[\r\n[\]]/g, " ").replace(/\s+/g, " ").trim() || "圖片";
  }

  async function uploadImage(file: File) {
    setIsUploading(true);
    setMessage("圖片上傳中...");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/admin/media/upload", {
        method: "POST",
        body: formData
      });
      const result = await readUploadResponse(response);

      if (!response.ok || !result.url) {
        throw new Error(result.error || `圖片上傳失敗，狀態碼：${response.status}`);
      }

      insertAtCursor(`![${imageAltText(result.fileName)}](${result.url})`);
      setMessage("圖片已插入 Markdown 內容。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "圖片上傳失敗。");
    } finally {
      setIsUploading(false);
    }
  }

  async function handlePaste(event: React.ClipboardEvent<HTMLTextAreaElement>) {
    const image = Array.from(event.clipboardData.files).find((file) => file.type.startsWith("image/"));
    if (!image) {
      onPaste?.(event);
      return;
    }

    event.preventDefault();
    await uploadImage(image);
  }

  async function handleDrop(event: React.DragEvent<HTMLTextAreaElement>) {
    const image = Array.from(event.dataTransfer.files).find((file) => file.type.startsWith("image/"));
    if (!image) {
      onDrop?.(event);
      return;
    }

    event.preventDefault();
    await uploadImage(image);
  }

  return (
    <div className="space-y-2">
      <Textarea
        ref={textareaRef}
        className={cn("min-h-72 font-mono", className)}
        onPaste={handlePaste}
        onDrop={handleDrop}
        {...props}
      />
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span aria-hidden="true">{isUploading ? "..." : "+"}</span>
        <span>{message ?? helperText ?? "可直接貼上或拖曳圖片，系統會自動插入 Markdown 圖片語法。"}</span>
      </div>
    </div>
  );
}
