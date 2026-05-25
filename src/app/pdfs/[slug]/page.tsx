import { notFound } from "next/navigation";
import { RelatedContent } from "@/components/related-content";
import { ShareButton } from "@/components/share-button";
import { Badge } from "@/components/ui/badge";
import { ViewTracker } from "@/components/view-tracker";
import { getPublishedPdfBySlug } from "@/lib/data";
import { getSharePath } from "@/lib/share-url";
import { createSocialMetadata } from "@/lib/social-metadata";
import { formatDate, formatFileSize } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const pdf = await getPublishedPdfBySlug(slug);
  if (!pdf) return { title: "PDF 文件" };

  return createSocialMetadata({
    title: pdf.title,
    description: pdf.description,
    path: getSharePath("pdf", pdf.id),
    section: "pdf"
  });
}

export default async function PdfDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const pdf = await getPublishedPdfBySlug(slug);
  if (!pdf) notFound();

  return (
    <main className="section-shell py-10">
      <ViewTracker contentType="pdf" contentId={pdf.id} title={pdf.title} path={getSharePath("pdf", pdf.id)} />
      <div className="detail-hero">
        <div className="absolute right-6 top-6 z-20">
          <ShareButton title={pdf.title} path={getSharePath("pdf", pdf.id)} />
        </div>
        <div className="mb-5 flex flex-wrap gap-2">
          <Badge className="border-slate-200 bg-slate-50 text-slate-700">PDF</Badge>
          {pdf.category ? <Badge>{pdf.category.name}</Badge> : null}
          {pdf.subcategory ? <Badge>{pdf.subcategory.name}</Badge> : null}
        </div>
        <h1 className="text-4xl font-semibold tracking-normal text-slate-950">{pdf.title}</h1>
        {pdf.description ? <p className="mt-4 max-w-3xl leading-7 text-muted-foreground">{pdf.description}</p> : null}
        <p className="mt-5 text-sm font-medium text-slate-500">
          更新日期：{formatDate(pdf.updatedAt)} · {pdf.fileName} · {formatFileSize(pdf.fileSize)}
        </p>
      </div>
      <div className="viewer-frame h-[78vh]">
        <object data={pdf.fileUrl} type="application/pdf" className="h-full w-full">
          <iframe src={pdf.fileUrl} title={pdf.title} className="h-full w-full" />
        </object>
      </div>
      <RelatedContent
        currentId={pdf.id}
        categoryId={pdf.categoryId}
        subcategoryId={pdf.subcategoryId}
        keywords={pdf.keywords}
      />
    </main>
  );
}
