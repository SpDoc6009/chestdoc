import type React from "react";
import Link from "next/link";
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
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "編輯教學內容"
};

export default async function EditTeachingLessonPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const [lesson, topics] = await Promise.all([
    prisma.teachingLesson.findUnique({ where: { id } }),
    prisma.teachingTopic.findMany({ orderBy: [{ sortOrder: "asc" }, { title: "asc" }] })
  ]);
  if (!lesson) notFound();

  return (
    <AdminShell title="編輯教學內容">
      <Card>
        <CardHeader><CardTitle>{lesson.title}</CardTitle></CardHeader>
        <CardContent>
          <div className="mb-5">
            <Link className="text-sm font-medium text-primary hover:underline" href={`/admin/teaching/preview/${lesson.id}`}>
              預覽目前已儲存版本
            </Link>
          </div>
          <form action={`/admin/teaching/${lesson.id}/update`} method="post" className="grid gap-4">
            <input type="hidden" name="id" value={lesson.id} />
            <Field name="title" label="標題" defaultValue={lesson.title} required />
            <Field name="slug" label="Slug" defaultValue={lesson.slug} required />
            <Field name="keywords" label="關鍵字" defaultValue={lesson.keywords.join(", ")} placeholder="例如：guideline, QA, COPD" />
            <div className="space-y-2">
              <Label htmlFor="topicId">教學分類</Label>
              <Select id="topicId" name="topicId" defaultValue={lesson.topicId} required>
                {topics.map((topic) => <option key={topic.id} value={topic.id}>{topic.title}</option>)}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="summary">摘要</Label>
              <Textarea id="summary" name="summary" required defaultValue={lesson.summary} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="markdownContent">Markdown 圖文內容</Label>
              <MarkdownEditor id="markdownContent" name="markdownContent" defaultValue={lesson.markdownContent ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="htmlContent">互動 HTML 程式碼</Label>
              <Textarea id="htmlContent" name="htmlContent" className="min-h-72 font-mono" defaultValue={lesson.htmlContent ?? ""} />
            </div>
            <div className="flex flex-wrap gap-5 text-sm">
              <label className="flex items-center gap-2"><input type="checkbox" name="isPublished" defaultChecked={lesson.isPublished} />發布</label>
              <label className="flex items-center gap-2"><input type="checkbox" name="isFeatured" defaultChecked={lesson.isFeatured} />精選</label>
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
