import type React from "react";
import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { createTeachingTopicAction, deleteTeachingLessonAction } from "@/lib/actions";
import { AdminShell } from "@/components/admin-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export const metadata = {
  title: "管理教學筆記"
};

export default async function AdminTeachingPage() {
  await requireAdmin();
  type TopicWithCount = Prisma.TeachingTopicGetPayload<{ include: { _count: { select: { lessons: true } } } }>;
  type LessonWithTopic = Prisma.TeachingLessonGetPayload<{ include: { topic: true } }>;
  let topics: TopicWithCount[] = [];
  let lessons: LessonWithTopic[] = [];

  try {
    [topics, lessons] = await Promise.all([
      prisma.teachingTopic.findMany({
        orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
        include: { _count: { select: { lessons: true } } }
      }),
      prisma.teachingLesson.findMany({
        orderBy: { updatedAt: "desc" },
        include: { topic: true }
      })
    ]);
  } catch (error) {
    console.error(error);
    return (
      <AdminShell title="教學筆記">
        <Card>
          <CardHeader><CardTitle>資料庫暫時連不上</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
            <p>目前無法連線到 Neon PostgreSQL。請確認網路連線、Neon 專案狀態，以及 .env 內的 DATABASE_URL 是否正確。</p>
            <p>如果你剛剛才修改 .env，請停止 dev server 後重新執行 npm run dev。</p>
          </CardContent>
        </Card>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="教學筆記">
      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        <Card>
          <CardHeader><CardTitle>新增教學分類</CardTitle></CardHeader>
          <CardContent>
            <form action={createTeachingTopicAction} className="space-y-4">
              <Field name="title" label="分類名稱" required />
              <Field name="slug" label="Slug" placeholder="可留空自動產生" />
              <Field name="sortOrder" label="排序" type="number" defaultValue="0" />
              <div className="space-y-2">
                <Label htmlFor="description">描述</Label>
                <Textarea id="description" name="description" />
              </div>
              <Button type="submit">新增分類</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle>教學內容</CardTitle>
              <Link className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90" href="/admin/teaching/new">
                新增教學內容
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>標題</TableHead>
                  <TableHead>分類</TableHead>
                  <TableHead>形式</TableHead>
                  <TableHead>狀態</TableHead>
                  <TableHead>更新</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lessons.map((lesson) => (
                  <TableRow key={lesson.id}>
                    <TableCell className="font-medium">{lesson.title}</TableCell>
                    <TableCell>{lesson.topic.title}</TableCell>
                    <TableCell>{formatLessonKind(lesson.markdownContent, lesson.htmlContent)}</TableCell>
                    <TableCell>{lesson.isPublished ? "已發布" : "草稿"}</TableCell>
                    <TableCell>{formatDate(lesson.updatedAt)}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap items-center gap-3">
                        <Link className="text-sm font-medium text-primary hover:underline" href={`/admin/teaching/${lesson.id}/edit`}>
                          編輯
                        </Link>
                        <Link className="text-sm font-medium text-primary hover:underline" href={`/admin/teaching/preview/${lesson.id}`}>
                          查看
                        </Link>
                        <form action={deleteTeachingLessonAction}>
                          <input type="hidden" name="id" value={lesson.id} />
                          <Button type="submit" variant="ghost" className="h-auto p-0 text-sm font-medium text-red-600 hover:bg-transparent hover:text-red-700">
                            刪除
                          </Button>
                        </form>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader><CardTitle>分類列表</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {topics.map((topic) => (
              <div key={topic.id} className="rounded-md border border-border bg-white p-4">
                <div className="font-medium">{topic.title}</div>
                <div className="mt-1 text-sm text-muted-foreground">{topic._count.lessons} 篇內容</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </AdminShell>
  );
}

function Field(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const { label, name, ...inputProps } = props;
  return <div className="space-y-2"><Label htmlFor={String(name)}>{label}</Label><Input id={String(name)} name={String(name)} {...inputProps} /></div>;
}

function formatLessonKind(markdown?: string | null, html?: string | null) {
  const hasMarkdown = Boolean(markdown?.trim());
  const hasHtml = Boolean(html?.trim());
  if (hasMarkdown && hasHtml) return "Markdown + HTML";
  if (hasHtml) return "互動 HTML";
  return "Markdown 圖文";
}
