"use client";

import * as React from "react";
import { ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";

type UploadResponse = {
  url?: string;
  fileName?: string;
  error?: string;
};

type HtmlImageUploaderProps = {
  targetId: string;
};

function cleanAltText(fileName?: string) {
  return (fileName || "醫學圖片")
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[\r\n"<>]/g, " ")
    .replace(/\s+/g, " ")
    .trim() || "醫學圖片";
}

async function readUploadResponse(response: Response) {
  const text = await response.text();
  if (!text) return {} as UploadResponse;

  try {
    return JSON.parse(text) as UploadResponse;
  } catch {
    return { error: text.slice(0, 160) };
  }
}

export function HtmlImageUploader({ targetId }: HtmlImageUploaderProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);

  function insertAtCursor(snippet: string) {
    const textarea = document.getElementById(targetId);
    if (!(textarea instanceof HTMLTextAreaElement)) {
      setMessage("找不到 HTML 編輯框，請重新整理後再試。");
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = textarea.value.slice(0, start);
    const after = textarea.value.slice(end);
    const prefix = before.length === 0 || before.endsWith("\n\n") ? "" : before.endsWith("\n") ? "\n" : "\n\n";
    const suffix = after.length === 0 || after.startsWith("\n\n") ? "" : after.startsWith("\n") ? "\n" : "\n\n";
    const inserted = `${prefix}${snippet}${suffix}`;

    textarea.value = `${before}${inserted}${after}`;
    textarea.focus();
    const cursor = before.length + inserted.length;
    textarea.setSelectionRange(cursor, cursor);
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
  }

  async function uploadImage(file: File) {
    if (!file.type.startsWith("image/")) {
      setMessage("請選擇圖片檔案。");
      return;
    }

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
        throw new Error(result.error || `圖片上傳失敗：${response.status}`);
      }

      const alt = cleanAltText(result.fileName);
      insertAtCursor(`<img src="${result.url}" alt="${alt}" class="figure-image" />`);
      setMessage("已插入圖片 HTML。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "圖片上傳失敗。");
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.currentTarget.files?.[0];
          if (file) void uploadImage(file);
        }}
      />
      <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()} disabled={isUploading}>
        <ImagePlus className="h-4 w-4" aria-hidden="true" />
        {isUploading ? "上傳中..." : "上傳圖片並插入"}
      </Button>
      <span className="text-xs text-muted-foreground">
        {message ?? "先把游標放到 HTML 中想插圖的位置。"}
      </span>
    </div>
  );
}
