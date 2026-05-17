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
import { getArticleBySlug } from "@/lib/data";
import { createHeadingIdFactory, extractMarkdownHeadings } from "@/lib/markdown";
import { formatDate } from "@/lib/utils";

type PageProps = {
  params: Promise<{ slug: string }>;
};

function reactNodeText(children: ReactNode): string {
  if (typeof children === "string" || typeof children === "number") return String(children);
  if (Array.isArray(children)) return children.map(reactNodeText).join("");
  return "";
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  return {
    title: article?.title ?? "圖文解說"
  };
}

export default async function ArticleDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const [article, isAdmin] = await Promise.all([getArticleBySlug(slug), hasAdminSession()]);
  if (!article || (!article.isPublished && !isAdmin)) notFound();
  const headings = extractMarkdownHeadings(article.content);
  const getHeadingId = createHeadingIdFactory();

  return (
    <main className="section-shell py-10">
      <ViewTracker contentType="article" contentId={article.id} title={article.title} path={`/articles/${article.id}`} />
      <article className="mx-auto max-w-6xl">
        <div className="detail-hero">
          <div className="absolute right-6 top-6 z-20">
            <PrintButton />
          </div>
          <div className="mb-5 flex flex-wrap gap-2">
            <Badge className="border-sky-100 bg-sky-50 text-sky-800">Visual Note</Badge>
            {article.category ? <Badge>{article.category.name}</Badge> : null}
            {article.subcategory ? <Badge>{article.subcategory.name}</Badge> : null}
            {article.keywords.map((keyword) => (
              <Badge key={keyword} className="border-slate-200 bg-white text-slate-600">
                <Link href={`/search?q=${encodeURIComponent(keyword)}`}>#{keyword}</Link>
              </Badge>
            ))}
            {!article.isPublished ? <Badge className="border-amber-200 bg-amber-50 text-amber-800">後台預覽</Badge> : null}
          </div>
          <h1 className="text-4xl font-semibold tracking-normal text-slate-950">{article.title}</h1>
          <p className="mt-4 leading-7 text-muted-foreground">{article.summary}</p>
          <p className="mt-5 text-sm font-medium text-slate-500">更新日期：{formatDate(article.updatedAt)}</p>
        </div>
        <div className={headings.length > 0 ? "mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_260px]" : "mx-auto mt-10 max-w-3xl"}>
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
              {article.content}
            </ReactMarkdown>
          </div>
          <TableOfContents headings={headings} />
        </div>
        <RelatedContent
          currentId={article.id}
          categoryId={article.categoryId}
          subcategoryId={article.subcategoryId}
          keywords={article.keywords}
        />
      </article>
    </main>
  );
}
