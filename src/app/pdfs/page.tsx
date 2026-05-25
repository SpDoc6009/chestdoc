import { ContentCard } from "@/components/content-card";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "PDF 文件庫"
};

export default async function PdfsPage() {
  const pdfs = await prisma.pdfDocument.findMany({
    where: { isPublished: true },
    orderBy: { updatedAt: "desc" },
    include: { category: true, subcategory: true }
  });

  return (
    <main className="section-shell py-10">
      <h1 className="text-3xl font-semibold tracking-normal">PDF 文件庫</h1>
      <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">收藏指南、表格、教學講義與臨床速查文件。</p>
      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {pdfs.map((pdf) => (
          <ContentCard
            key={pdf.id}
            href={`/p/${pdf.id}`}
            title={pdf.title}
            summary={pdf.description}
            date={pdf.updatedAt}
            label={pdf.subcategory?.name ?? pdf.category?.name ?? "PDF"}
            type="pdf"
            keywords={pdf.keywords}
          />
        ))}
      </div>
    </main>
  );
}
