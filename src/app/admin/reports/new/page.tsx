import type React from "react";
import { createReportAction } from "@/lib/actions";
import { AdminShell } from "@/components/admin-shell";
import { HtmlImageUploader } from "@/components/html-image-uploader";
import { MarkdownEditor } from "@/components/markdown-editor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { requireAdmin } from "@/lib/auth";
import { getCategoryOptions } from "@/lib/data";

export const metadata = {
  title: "新增醫學新知"
};

export default async function NewReportPage() {
  await requireAdmin();
  const categories = await getCategoryOptions();

  return (
    <AdminShell title="新增醫學新知">
      <Card>
        <CardHeader><CardTitle>醫學新知內容</CardTitle></CardHeader>
        <CardContent>
          <form action={createReportAction} className="grid gap-4">
            <Field name="title" label="標題" required />
            <Field name="slug" label="Slug" placeholder="可留空自動產生" />
            <Field name="keywords" label="關鍵字" placeholder="例如：guideline, oncology, SCLC" />
            <div className="grid gap-4 md:grid-cols-2">
              <CategorySelect categories={categories} />
              <SubcategorySelect categories={categories} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="summary">摘要</Label>
              <Textarea id="summary" name="summary" required />
            </div>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Label htmlFor="htmlContent">完整 HTML 程式碼</Label>
                <HtmlImageUploader targetId="htmlContent" />
              </div>
              <Textarea id="htmlContent" name="htmlContent" required className="min-h-96 font-mono" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="markdownContent">Markdown 補充內容</Label>
              <MarkdownEditor
                id="markdownContent"
                name="markdownContent"
                className="min-h-72"
                helperText="可選填：會顯示在 HTML 內容下方，適合補充重點、參考資料或延伸閱讀。"
              />
            </div>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isPublished" defaultChecked />發布</label>
            <Button type="submit">建立醫學新知</Button>
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
