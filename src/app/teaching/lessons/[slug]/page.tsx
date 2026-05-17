import Link from "next/link";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { MarkdownCallout } from "@/components/markdown-callout";
import { PrintButton } from "@/components/print-button";
import { RelatedContent } from "@/components/related-content";
import { Badge } from "@/components/ui/badge";
import { TableOfContents } from "@/components/table-of-contents";
import { ViewTracker } from "@/components/view-tracker";
import { hasAdminSession } from "@/lib/auth";
import { getTeachingLessonBySlug } from "@/lib/data";
import { createHeadingIdFactory, extractMarkdownHeadings } from "@/lib/markdown";
import { formatDate } from "@/lib/utils";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
};

function reactNodeText(children: ReactNode): string {
  if (typeof children === "string" || typeof children === "number") return String(children);
  if (Array.isArray(children)) return children.map(reactNodeText).join("");
  return "";
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lesson = await getTeachingLessonBySlug(slug);
  return { title: lesson?.title ?? "教學筆記" };
}

export default async function TeachingLessonPage({ params, searchParams }: PageProps) {
  const [{ slug }, { preview }] = await Promise.all([params, searchParams]);
  const [lesson, isAdmin] = await Promise.all([getTeachingLessonBySlug(slug), hasAdminSession()]);
  if (!lesson || (!lesson.isPublished && !isAdmin)) notFound();

  const hasMarkdown = Boolean(lesson.markdownContent?.trim());
  const hasHtml = Boolean(lesson.htmlContent?.trim());
  const headings = extractMarkdownHeadings(lesson.markdownContent ?? "");
  const getHeadingId = createHeadingIdFactory();
  const iframeSrc = `/teaching/lessons/${lesson.id}/content${preview === "1" || !lesson.isPublished ? "?preview=1" : ""}`;

  return (
    <main className="section-shell py-10">
      <ViewTracker contentType="teaching" contentId={lesson.id} title={lesson.title} path={`/teaching/lessons/${lesson.id}`} />
      <article className={hasHtml ? "" : "mx-auto max-w-3xl"}>
        <div className="detail-hero">
          <div className="absolute right-6 top-6 z-20">
            <PrintButton />
          </div>
          <div className="mb-5 flex flex-wrap gap-2">
            <Badge className="border-amber-100 bg-amber-50 text-amber-800">Teaching</Badge>
            <Badge>{lesson.topic.title}</Badge>
            {hasMarkdown ? <Badge>圖文筆記</Badge> : null}
            {hasHtml ? <Badge>互動教學</Badge> : null}
            {lesson.keywords.map((keyword) => (
              <Badge key={keyword} className="border-slate-200 bg-white text-slate-600">
                <Link href={`/search?q=${encodeURIComponent(keyword)}`}>#{keyword}</Link>
              </Badge>
            ))}
            {!lesson.isPublished ? <Badge className="border-amber-200 bg-amber-50 text-amber-800">後台預覽</Badge> : null}
          </div>
          <h1 className="text-4xl font-semibold tracking-normal text-slate-950">{lesson.title}</h1>
          <p className="mt-4 max-w-3xl leading-7 text-muted-foreground">{lesson.summary}</p>
          <p className="mt-5 text-sm font-medium text-slate-500">更新日期：{formatDate(lesson.updatedAt)}</p>
        </div>

        {hasMarkdown ? (
          <div className={headings.length > 0 ? "mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_260px]" : "mt-10 max-w-3xl"}>
            <div className="reader-prose max-w-3xl">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h2({ children }) {
                    const text = reactNodeText(children);
                    if (!text.trim()) return <div className="my-8">{children}</div>;
                    return <h2 id={getHeadingId(text)}>{children}</h2>;
                  },
                  h3({ children }) {
                    const text = reactNodeText(children);
                    if (!text.trim()) return <div className="my-8">{children}</div>;
                    return <h3 id={getHeadingId(text)}>{children}</h3>;
                  },
                  blockquote({ children }) {
                    return <MarkdownCallout>{children}</MarkdownCallout>;
                  }
                }}
              >
                {lesson.markdownContent ?? ""}
              </ReactMarkdown>
            </div>
            <TableOfContents headings={headings} />
          </div>
        ) : null}

        {hasHtml ? (
          <div className="viewer-frame h-[82vh]">
            <iframe
              title={lesson.title}
              src={iframeSrc}
              sandbox="allow-scripts allow-forms allow-popups"
              className="h-full w-full"
            />
          </div>
        ) : null}
        <RelatedContent currentId={lesson.id} keywords={lesson.keywords} />
      </article>
    </main>
  );
}
