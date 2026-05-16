import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Badge } from "@/components/ui/badge";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export const metadata = {
  title: "預覽教學內容"
};

export default async function AdminTeachingPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const lesson = await prisma.teachingLesson.findUnique({
    where: { id },
    include: { topic: true }
  });
  if (!lesson) notFound();

  const hasMarkdown = Boolean(lesson.markdownContent?.trim());
  const hasHtml = Boolean(lesson.htmlContent?.trim());

  return (
    <main className="section-shell py-10">
      <article className={hasHtml ? "" : "mx-auto max-w-3xl"}>
        <div className="mb-6 flex flex-wrap gap-2">
          <Badge>{lesson.topic.title}</Badge>
          {hasMarkdown ? <Badge>圖文筆記</Badge> : null}
          {hasHtml ? <Badge>互動教學</Badge> : null}
          <Badge className="border-amber-200 bg-amber-50 text-amber-800">後台預覽</Badge>
        </div>
        <h1 className="text-4xl font-semibold tracking-normal text-slate-950">{lesson.title}</h1>
        <p className="mt-4 max-w-3xl leading-7 text-muted-foreground">{lesson.summary}</p>
        <p className="mt-4 text-sm text-muted-foreground">更新日期：{formatDate(lesson.updatedAt)}</p>

        {hasMarkdown ? (
          <div className="prose prose-slate mt-9 max-w-3xl prose-headings:scroll-mt-24 prose-headings:tracking-normal prose-a:text-primary">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{lesson.markdownContent ?? ""}</ReactMarkdown>
          </div>
        ) : null}

        {hasHtml ? (
          <div className="mt-8 h-[82vh] overflow-hidden rounded-lg border border-border bg-white">
            <iframe
              title={lesson.title}
              src={`/admin/teaching/preview/${lesson.id}/content`}
              sandbox="allow-scripts allow-forms allow-popups"
              className="h-full w-full"
            />
          </div>
        ) : null}
      </article>
    </main>
  );
}
