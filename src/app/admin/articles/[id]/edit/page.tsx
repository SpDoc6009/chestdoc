import type React from "react";
import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MarkdownEditor } from "@/components/markdown-editor";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { requireAdmin } from "@/lib/auth";
import { getCategoryOptions } from "@/lib/data";
import { educationTopicOptions, getEducationTopicValueFromKeywords } from "@/lib/education-topics";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "編輯圖文解說"
};

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const [article, categories] = await Promise.all([
    prisma.article.findUnique({ where: { id } }),
    getCategoryOptions()
  ]);
  if (!article) notFound();

  return (
    <AdminShell title="編輯圖文解說">
      <Card>
        <CardHeader><CardTitle>{article.title}</CardTitle></CardHeader>
        <CardContent>
          <form action={`/admin/articles/${article.id}/update`} method="post" className="grid gap-4">
            <input type="hidden" name="id" value={article.id} />
            <Field name="title" label="標題" defaultValue={article.title} required />
            <Field name="slug" label="Slug" defaultValue={article.slug} required />
            <Field name="keywords" label="關鍵字" defaultValue={article.keywords.join(", ")} placeholder="例如：guideline, COPD, ILD" />
            <EducationTopicSelect defaultValue={getEducationTopicValueFromKeywords(article.keywords)} />
            <div className="grid gap-4 md:grid-cols-2">
              <CategorySelect categories={categories} defaultValue={article.categoryId ?? ""} />
              <SubcategorySelect categories={categories} defaultValue={article.subcategoryId ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="summary">摘要</Label>
              <Textarea id="summary" name="summary" required defaultValue={article.summary} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Markdown 內容</Label>
              <MarkdownEditor id="content" name="content" required className="min-h-96" defaultValue={article.content} />
            </div>
            <div className="flex flex-wrap gap-5 text-sm">
              <label className="flex items-center gap-2"><input type="checkbox" name="isPublished" defaultChecked={article.isPublished} />發布</label>
              <label className="flex items-center gap-2"><input type="checkbox" name="isFeatured" defaultChecked={article.isFeatured} />精選</label>
            </div>
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

function EducationTopicSelect({ defaultValue }: { defaultValue: string }) {
  return (
    <div className="space-y-2">
      <Label htmlFor="educationTopic">衛教主題（選填）</Label>
      <Select id="educationTopic" name="educationTopic" defaultValue={defaultValue}>
        <option value="">不指定衛教主題</option>
        {educationTopicOptions.map((topic) => (
          <option key={topic.value} value={topic.value}>
            {topic.label}
          </option>
        ))}
      </Select>
    </div>
  );
}
