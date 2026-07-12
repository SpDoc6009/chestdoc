"use client";

import * as React from "react";
import { ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  createHtmlImageSnippet,
  createMarkdownImageSnippet,
  insertBlockAtSelection,
} from "@/lib/editor-image";

type UploadResponse = {
  url?: string;
  fileName?: string;
  error?: string;
};

type ImageInsertControlProps = {
  targetId: string;
  mode: "html" | "markdown";
  helperText?: string;
};

async function readUploadResponse(response: Response) {
  const body = await response.text();
  if (!body) return {} as UploadResponse;

  try {
    return JSON.parse(body) as UploadResponse;
  } catch {
    return { error: body.slice(0, 160) };
  }
}

export function ImageInsertControl({ targetId, mode, helperText }: ImageInsertControlProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);

  const insertAtCursor = React.useCallback((snippet: string) => {
    const textarea = document.getElementById(targetId);
    if (!(textarea instanceof HTMLTextAreaElement)) {
      setMessage("找不到內容欄位，請重新整理頁面後再試。");
      return;
    }

    const result = insertBlockAtSelection(
      textarea.value,
      textarea.selectionStart,
      textarea.selectionEnd,
      snippet,
    );

    textarea.value = result.value;
    textarea.focus();
    textarea.setSelectionRange(result.cursor, result.cursor);
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
  }, [targetId]);

  const uploadImage = React.useCallback(async (file: File) => {
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
        body: formData,
      });
      const result = await readUploadResponse(response);

      if (!response.ok || !result.url) {
        throw new Error(result.error || `圖片上傳失敗（${response.status}）。`);
      }

      const snippet = mode === "html"
        ? createHtmlImageSnippet(result.url, result.fileName || file.name)
        : createMarkdownImageSnippet(result.url, result.fileName || file.name);
      insertAtCursor(snippet);
      setMessage(mode === "html" ? "圖片已插入 HTML。" : "圖片已插入 Markdown。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "圖片上傳失敗。");
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }, [insertAtCursor, mode]);

  React.useEffect(() => {
    const textarea = document.getElementById(targetId);
    if (!(textarea instanceof HTMLTextAreaElement)) return;

    function imageFromFiles(files: FileList | null) {
      return Array.from(files ?? []).find((file) => file.type.startsWith("image/"));
    }

    function handlePaste(event: ClipboardEvent) {
      const image = imageFromFiles(event.clipboardData?.files ?? null);
      if (!image) return;
      event.preventDefault();
      void uploadImage(image);
    }

    function handleDragOver(event: DragEvent) {
      if (Array.from(event.dataTransfer?.types ?? []).includes("Files")) event.preventDefault();
    }

    function handleDrop(event: DragEvent) {
      const image = imageFromFiles(event.dataTransfer?.files ?? null);
      if (!image) return;
      event.preventDefault();
      void uploadImage(image);
    }

    textarea.addEventListener("paste", handlePaste);
    textarea.addEventListener("dragover", handleDragOver);
    textarea.addEventListener("drop", handleDrop);

    return () => {
      textarea.removeEventListener("paste", handlePaste);
      textarea.removeEventListener("dragover", handleDragOver);
      textarea.removeEventListener("drop", handleDrop);
    };
  }, [targetId, uploadImage]);

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
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
      >
        <ImagePlus className="h-4 w-4" aria-hidden="true" />
        {isUploading ? "上傳中..." : "上傳圖片並插入"}
      </Button>
      <span className="text-xs text-muted-foreground" aria-live="polite">
        {message ?? helperText ?? "可點選、貼上或拖曳圖片，系統會插入目前游標位置。"}
      </span>
    </div>
  );
}
