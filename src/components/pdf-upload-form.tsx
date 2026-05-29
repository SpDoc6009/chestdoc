"use client";

import * as React from "react";
import { upload } from "@vercel/blob/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type CategoryOption = {
  id: string;
  name: string;
  subcategories: Array<{ id: string; name: string }>;
};

type PdfUploadFormProps = {
  categories: CategoryOption[];
};

function value(formData: FormData, key: string) {
  const entry = formData.get(key);
  return typeof entry === "string" ? entry.trim() : "";
}

function checked(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

export function PdfUploadForm({ categories }: PdfUploadFormProps) {
  const formRef = React.useRef<HTMLFormElement>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = formRef.current;
    if (!form) return;

    const formData = new FormData(form);
    const file = formData.get("file");

    if (!(file instanceof File) || file.size === 0) {
      setMessage("請選擇 PDF 檔案。");
      return;
    }

    if (file.type !== "application/pdf") {
      setMessage("只能上傳 PDF 檔案。");
      return;
    }

    setIsUploading(true);
    setMessage("PDF 正在上傳到 Blob，請不要關閉頁面...");

    try {
      const blob = await upload(`pdfs/${Date.now()}-${file.name}`, file, {
        access: "public",
        contentType: "application/pdf",
        handleUploadUrl: "/admin/pdfs/client-upload"
      });

      setMessage("PDF 已上傳，正在建立文件資料...");

      const response = await fetch("/admin/pdfs/create-from-blob", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: value(formData, "title"),
          slug: value(formData, "slug"),
          keywords: value(formData, "keywords"),
          categoryId: value(formData, "categoryId"),
          subcategoryId: value(formData, "subcategoryId"),
          description: value(formData, "description"),
          isPublished: checked(formData, "isPublished"),
          fileUrl: blob.url,
          fileName: file.name,
          fileSize: file.size
        })
      });

      const result = (await response.json()) as { error?: string; redirectTo?: string };
      if (!response.ok) {
        throw new Error(result.error || "PDF 資料建立失敗。");
      }

      window.location.href = result.redirectTo || "/admin/pdfs?created=1";
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "PDF 上傳失敗。");
      setIsUploading(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="grid gap-4">
      <Field name="title" label="標題" required />
      <Field name="slug" label="Slug" placeholder="可留空自動產生" />
      <Field name="keywords" label="關鍵字" placeholder="例如：guideline, COPD, 衛教" />
      <div className="grid gap-4 md:grid-cols-2">
        <CategorySelect categories={categories} />
        <SubcategorySelect categories={categories} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">描述</Label>
        <Textarea id="description" name="description" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="file">PDF 檔案</Label>
        <Input id="file" name="file" type="file" accept="application/pdf" required disabled={isUploading} />
        <p className="text-xs leading-5 text-muted-foreground">
          大檔案會直接上傳到 Vercel Blob，不會再經過 Serverless Function。
        </p>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isPublished" defaultChecked disabled={isUploading} />
        發布
      </label>
      {message ? <p className="text-sm leading-6 text-muted-foreground">{message}</p> : null}
      <Button type="submit" disabled={isUploading}>
        {isUploading ? "上傳中..." : "上傳 PDF"}
      </Button>
    </form>
  );
}

function Field(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const { label, name, ...inputProps } = props;
  return (
    <div className="space-y-2">
      <Label htmlFor={String(name)}>{label}</Label>
      <Input id={String(name)} name={String(name)} disabled={inputProps.disabled} {...inputProps} />
    </div>
  );
}

function CategorySelect({ categories }: { categories: CategoryOption[] }) {
  return (
    <div className="space-y-2">
      <Label htmlFor="categoryId">大分類</Label>
      <Select id="categoryId" name="categoryId">
        <option value="">未分類</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </Select>
    </div>
  );
}

function SubcategorySelect({ categories }: { categories: CategoryOption[] }) {
  return (
    <div className="space-y-2">
      <Label htmlFor="subcategoryId">小分類</Label>
      <Select id="subcategoryId" name="subcategoryId">
        <option value="">未指定</option>
        {categories.flatMap((category) =>
          category.subcategories.map((subcategory) => (
            <option key={subcategory.id} value={subcategory.id}>
              {category.name} / {subcategory.name}
            </option>
          ))
        )}
      </Select>
    </div>
  );
}
