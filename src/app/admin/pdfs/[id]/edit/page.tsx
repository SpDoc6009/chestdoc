import type React from "react";
import { notFound } from "next/navigation";
import { updatePdfAction } from "@/lib/actions";
import { AdminShell } from "@/components/admin-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { requireAdmin } from "@/lib/auth";
import { getCategoryOptions } from "@/lib/data";
import { prisma } from "@/lib/prisma";
import { formatFileSize } from "@/lib/utils";

export const metadata = {
  title: "編輯 PDF"
};

export default async function EditPdfPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const [pdf, categories] = await Promise.all([
    prisma.pdfDocument.findUnique({ where: { id } }),
    getCategoryOptions()
  ]);
  if (!pdf) notFound();

  return (
    <AdminShell title="編輯 PDF 文件">
      <Card>
        <CardHeader>
          <CardTitle>{pdf.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updatePdfAction} className="grid gap-4">
            <input type="hidden" name="id" value={pdf.id} />
            <Field name="title" label="標題" defaultValue={pdf.title} required />
            <Field name="slug" label="Slug" defaultValue={pdf.slug} required />
            <Field name="keywords" label="關鍵字" defaultValue={pdf.keywords.join(", ")} placeholder="例如：guideline, COPD, 衛教" />
            <div className="grid gap-4 md:grid-cols-2">
              <CategorySelect categories={categories} defaultValue={pdf.categoryId ?? ""} />
              <SubcategorySelect categories={categories} defaultValue={pdf.subcategoryId ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">描述</Label>
              <Textarea id="description" name="description" defaultValue={pdf.description ?? ""} />
            </div>
            <div className="rounded-md border border-border bg-slate-50 px-3 py-2 text-sm text-muted-foreground">
              目前檔案：{pdf.fileName}（{formatFileSize(pdf.fileSize)}）
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="isPublished" defaultChecked={pdf.isPublished} />
              發布
            </label>
            <Button type="submit">儲存變更</Button>
          </form>
        </CardContent>
      </Card>
    </AdminShell>
  );
}

function Field(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const { label, name, ...inputProps } = props;
  return <div className="space-y-2"><Label htmlFor={String(name)}>{label}</Label><Input id={String(name)} name={String(name)} {...inputProps} /></div>;
}

function CategorySelect({ categories, defaultValue }: { categories: Awaited<ReturnType<typeof getCategoryOptions>>; defaultValue: string }) {
  return <div className="space-y-2"><Label htmlFor="categoryId">大分類</Label><Select id="categoryId" name="categoryId" defaultValue={defaultValue}><option value="">未分類</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</Select></div>;
}

function SubcategorySelect({ categories, defaultValue }: { categories: Awaited<ReturnType<typeof getCategoryOptions>>; defaultValue: string }) {
  return <div className="space-y-2"><Label htmlFor="subcategoryId">小分類</Label><Select id="subcategoryId" name="subcategoryId" defaultValue={defaultValue}><option value="">未指定</option>{categories.flatMap((category) => category.subcategories.map((subcategory) => <option key={subcategory.id} value={subcategory.id}>{category.name} / {subcategory.name}</option>))}</Select></div>;
}
