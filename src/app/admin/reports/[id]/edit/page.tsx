import type React from "react";
import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import { HtmlImageUploader } from "@/components/html-image-uploader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { requireAdmin } from "@/lib/auth";
import { getCategoryOptions } from "@/lib/data";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "編輯醫學新知"
};

export default async function EditReportPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const [report, categories] = await Promise.all([
    prisma.htmlReport.findUnique({ where: { id } }),
    getCategoryOptions()
  ]);
  if (!report) notFound();

  return (
    <AdminShell title="編輯醫學新知">
      <Card>
        <CardHeader><CardTitle>{report.title}</CardTitle></CardHeader>
        <CardContent>
          <form action={`/admin/reports/${report.id}/update`} method="post" className="grid gap-4">
            <input type="hidden" name="id" value={report.id} />
            <Field name="title" label="標題" defaultValue={report.title} required />
            <Field name="slug" label="Slug" defaultValue={report.slug} required />
            <Field name="keywords" label="關鍵字" defaultValue={report.keywords.join(", ")} placeholder="例如：guideline, oncology, SCLC" />
            <div className="grid gap-4 md:grid-cols-2">
              <CategorySelect categories={categories} defaultValue={report.categoryId ?? ""} />
              <SubcategorySelect categories={categories} defaultValue={report.subcategoryId ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="summary">摘要</Label>
              <Textarea id="summary" name="summary" required defaultValue={report.summary} />
            </div>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Label htmlFor="htmlContent">完整 HTML 程式碼</Label>
                <HtmlImageUploader targetId="htmlContent" />
              </div>
              <Textarea id="htmlContent" name="htmlContent" required className="min-h-96 font-mono" defaultValue={report.htmlContent} />
            </div>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isPublished" defaultChecked={report.isPublished} />發布</label>
            <Button type="submit">儲存修改</Button>
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
