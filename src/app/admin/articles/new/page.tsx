import type React from "react";
import { createArticleAction } from "@/lib/actions";
import { AdminShell } from "@/components/admin-shell";
import { HtmlImageUploader } from "@/components/html-image-uploader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MarkdownEditor } from "@/components/markdown-editor";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { requireAdmin } from "@/lib/auth";
import { getCategoryOptions } from "@/lib/data";
import { educationTopicOptions } from "@/lib/education-topics";

export const metadata = {
  title: "新增圖文解說"
};

export default async function NewArticlePage({ searchParams }: { searchParams: Promise<{ kind?: string }> }) {
  await requireAdmin();
  const [{ kind }, categories] = await Promise.all([searchParams, getCategoryOptions()]);
  const isEducation = kind === "education";

  return (
    <AdminShell title="新增圖文解說">
      <Card>
        <CardHeader><CardTitle>圖文內容</CardTitle></CardHeader>
        <CardContent>
          <form action={createArticleAction} className="grid gap-4">
            <Field name="title" label="標題" required />
            <Field name="slug" label="Slug" placeholder="可留空自動產生" />
            <Field
              name="keywords"
              label="關鍵字"
              defaultValue={isEducation ? "衛教, patient-education, 病人與家屬" : undefined}
              placeholder="例如：guideline, COPD, ILD"
            />
            {isEducation ? <EducationTopicSelect required /> : null}
            <div className="grid gap-4 md:grid-cols-2">
              <CategorySelect categories={categories} />
              <SubcategorySelect categories={categories} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="summary">摘要</Label>
              <Textarea id="summary" name="summary" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Markdown 內容</Label>
              <MarkdownEditor id="content" name="content" className="min-h-96" helperText="Markdown 或 HTML 擇一填寫；兩欄都填時會先顯示 Markdown，再顯示 HTML。" />
            </div>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Label htmlFor="htmlContent">HTML 程式碼</Label>
                <HtmlImageUploader targetId="htmlContent" />
              </div>
              <Textarea id="htmlContent" name="htmlContent" className="min-h-96 font-mono" />
            </div>
            <Checks featured />
            <Button type="submit">建立圖文解說</Button>
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

function EducationTopicSelect({ required = false }: { required?: boolean }) {
  return (
    <div className="space-y-2">
      <Label htmlFor="educationTopic">衛教主題</Label>
      <Select id="educationTopic" name="educationTopic" required={required}>
        <option value="">請選擇衛教主題</option>
        {educationTopicOptions.map((topic) => (
          <option key={topic.value} value={topic.value}>
            {topic.label}
          </option>
        ))}
      </Select>
    </div>
  );
}

function Checks({ featured = false }: { featured?: boolean }) {
  return <div className="flex flex-wrap gap-5 text-sm"><label className="flex items-center gap-2"><input type="checkbox" name="isPublished" defaultChecked />發布</label>{featured ? <label className="flex items-center gap-2"><input type="checkbox" name="isFeatured" />精選</label> : null}</div>;
}
