import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { AutoHeightReportFrame } from "@/components/auto-height-report-frame";
import { MarkdownCallout } from "@/components/markdown-callout";
import { RelatedContent } from "@/components/related-content";
import { ShareButton } from "@/components/share-button";
import { Badge } from "@/components/ui/badge";
import { ViewTracker } from "@/components/view-tracker";
import { getPublishedReportBySlug } from "@/lib/data";
import { getSharePath } from "@/lib/share-url";
import { createSocialMetadata, firstHtmlImage, firstMarkdownImage } from "@/lib/social-metadata";
import { formatDate } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const report = await getPublishedReportBySlug(slug);
  if (!report) return { title: "醫學新知" };

  return createSocialMetadata({
    title: report.title,
    description: report.summary,
    path: getSharePath("report", report.id),
    section: "report",
    image: firstHtmlImage(report.htmlContent) ?? firstMarkdownImage(report.markdownContent)
  });
}

export default async function ReportDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const report = await getPublishedReportBySlug(slug);
  if (!report) notFound();
  const hasMarkdown = Boolean(report.markdownContent?.trim());

  return (
    <main className="section-shell py-10">
      <ViewTracker contentType="report" contentId={report.id} title={report.title} path={getSharePath("report", report.id)} />
      <div className="detail-hero">
        <div className="absolute right-6 top-6 z-20">
          <ShareButton title={report.title} path={getSharePath("report", report.id)} />
        </div>
        <div className="mb-5 flex flex-wrap gap-2">
          <Badge className="border-indigo-100 bg-indigo-50 text-indigo-800">Medical Update</Badge>
          {report.category ? <Badge>{report.category.name}</Badge> : null}
          {report.subcategory ? <Badge>{report.subcategory.name}</Badge> : null}
          {report.keywords.map((keyword) => (
            <Badge key={keyword} className="border-slate-200 bg-white text-slate-600">
              <Link href={`/search?q=${encodeURIComponent(keyword)}`}>#{keyword}</Link>
            </Badge>
          ))}
        </div>
        <h1 className="text-4xl font-semibold tracking-normal text-slate-950">{report.title}</h1>
        <p className="mt-4 max-w-3xl leading-7 text-muted-foreground">{report.summary}</p>
        <p className="mt-5 text-sm font-medium text-slate-500">更新日期：{formatDate(report.updatedAt)}</p>
      </div>
      <AutoHeightReportFrame title={report.title} src={`/reports/${report.id}/content`} reportId={report.id} />
      {hasMarkdown ? (
        <section className="reader-prose mx-auto mt-10 max-w-3xl">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              blockquote({ children }) {
                return <MarkdownCallout>{children}</MarkdownCallout>;
              }
            }}
          >
            {report.markdownContent ?? ""}
          </ReactMarkdown>
        </section>
      ) : null}
      <RelatedContent
        currentId={report.id}
        categoryId={report.categoryId}
        subcategoryId={report.subcategoryId}
        keywords={report.keywords}
      />
    </main>
  );
}
