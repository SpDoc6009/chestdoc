import Link from "next/link";
import { notFound } from "next/navigation";
import { RelatedContent } from "@/components/related-content";
import { Badge } from "@/components/ui/badge";
import { getPublishedReportBySlug } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const report = await getPublishedReportBySlug(slug);
  return {
    title: report?.title ?? "醫學新知"
  };
}

export default async function ReportDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const report = await getPublishedReportBySlug(slug);
  if (!report) notFound();

  return (
    <main className="section-shell py-10">
      <div className="detail-hero">
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
      <div className="viewer-frame h-[78vh]">
        <iframe
          title={report.title}
          src={`/reports/${report.id}/content`}
          sandbox="allow-scripts allow-forms allow-popups"
          className="h-full w-full"
        />
      </div>
      <RelatedContent
        currentId={report.id}
        categoryId={report.categoryId}
        subcategoryId={report.subcategoryId}
        keywords={report.keywords}
      />
    </main>
  );
}
