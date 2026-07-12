import type React from "react";
import { createTeachingLessonAction } from "@/lib/actions";
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
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "新增教學內容"
};

export default async function NewTeachingLessonPage() {
  await requireAdmin();
  const topics = await prisma.teachingTopic.findMany({
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }]
  });

  return (
    <AdminShell title="新增教學內容">
      <Card>
        <CardHeader><CardTitle>Markdown 圖文與互動 HTML</CardTitle></CardHeader>
        <CardContent>
          <form action={createTeachingLessonAction} className="grid gap-4">
            <Field name="title" label="標題" required />
            <Field name="slug" label="Slug" placeholder="可留空自動產生" />
            <Field name="keywords" label="關鍵字" placeholder="例如：guideline, QA, COPD" />
            <div className="space-y-2">
              <Label htmlFor="topicId">教學分類</Label>
              <Select id="topicId" name="topicId" required>
                <option value="">選擇分類</option>
                {topics.map((topic) => <option key={topic.id} value={topic.id}>{topic.title}</option>)}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="summary">摘要</Label>
              <Textarea id="summary" name="summary" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="htmlContent">互動 HTML 程式碼</Label>
              <HtmlImageUploader targetId="htmlContent" />
              <Textarea
                id="htmlContent"
                name="htmlContent"
                className="min-h-72 font-mono"
                placeholder="可貼完整 HTML。若 Markdown 和 HTML 都有內容，前台會兩者都顯示。"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="markdownContent">Markdown 圖文內容</Label>
              <MarkdownEditor
                id="markdownContent"
                name="markdownContent"
                placeholder="可貼 Markdown。若要插圖，可用：![圖片說明](圖片網址)"
              />
            </div>
            <div className="flex flex-wrap gap-5 text-sm">
              <label className="flex items-center gap-2"><input type="checkbox" name="isPublished" defaultChecked />發布</label>
              <label className="flex items-center gap-2"><input type="checkbox" name="isFeatured" />精選</label>
            </div>
            <Button type="submit">建立教學內容</Button>
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
