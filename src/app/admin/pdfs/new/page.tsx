import type React from "react";
import { AdminShell } from "@/components/admin-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { requireAdmin } from "@/lib/auth";
import { getCategoryOptions } from "@/lib/data";

export const metadata = {
  title: "上傳 PDF"
};

export default async function NewPdfPage() {
  await requireAdmin();
  const categories = await getCategoryOptions();

  return (
    <AdminShell title="上傳 PDF 文件">
      <Card>
        <CardHeader><CardTitle>PDF 資訊</CardTitle></CardHeader>
        <CardContent>
          <form action="/admin/pdfs/create" method="post" encType="multipart/form-data" className="grid gap-4">
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
              <Input id="file" name="file" type="file" accept="application/pdf" required />
            </div>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isPublished" defaultChecked />發布</label>
            <Button type="submit">上傳 PDF</Button>
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

function CategorySelect({ categories }: { categories: Awaited<ReturnType<typeof getCategoryOptions>> }) {
  return <div className="space-y-2"><Label htmlFor="categoryId">大分類</Label><Select id="categoryId" name="categoryId"><option value="">未分類</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</Select></div>;
}

function SubcategorySelect({ categories }: { categories: Awaited<ReturnType<typeof getCategoryOptions>> }) {
  return <div className="space-y-2"><Label htmlFor="subcategoryId">小分類</Label><Select id="subcategoryId" name="subcategoryId"><option value="">未指定</option>{categories.flatMap((category) => category.subcategories.map((subcategory) => <option key={subcategory.id} value={subcategory.id}>{category.name} / {subcategory.name}</option>))}</Select></div>;
}
