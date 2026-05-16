import { ContentCard } from "@/components/content-card";
import { prisma } from "@/lib/prisma";

type RelatedContentProps = {
  currentId: string;
  categoryId?: string | null;
  subcategoryId?: string | null;
  keywords?: string[];
};

function keywordOr(keywords: string[]) {
  return keywords.slice(0, 6).map((keyword) => ({ keywords: { has: keyword } }));
}

export async function RelatedContent({ currentId, categoryId, subcategoryId, keywords = [] }: RelatedContentProps) {
  const sharedWhere = {
    OR: [
      ...(categoryId ? [{ categoryId }] : []),
      ...(subcategoryId ? [{ subcategoryId }] : []),
      ...keywordOr(keywords)
    ]
  };

  if (sharedWhere.OR.length === 0) return null;

  const lessonWhere = keywordOr(keywords);
  const [articles, reports, lessons, pdfs] = await Promise.all([
    prisma.article.findMany({
      where: { id: { not: currentId }, isPublished: true, ...sharedWhere },
      orderBy: { updatedAt: "desc" },
      include: { category: true, subcategory: true },
      take: 3
    }),
    prisma.htmlReport.findMany({
      where: { id: { not: currentId }, isPublished: true, ...sharedWhere },
      orderBy: { updatedAt: "desc" },
      include: { category: true, subcategory: true },
      take: 3
    }),
    prisma.teachingLesson.findMany({
      where: {
        id: { not: currentId },
        isPublished: true,
        ...(lessonWhere.length > 0 ? { OR: lessonWhere } : {})
      },
      orderBy: { updatedAt: "desc" },
      include: { topic: true },
      take: 3
    }),
    prisma.pdfDocument.findMany({
      where: { id: { not: currentId }, isPublished: true, ...sharedWhere },
      orderBy: { updatedAt: "desc" },
      include: { category: true, subcategory: true },
      take: 3
    })
  ]);

  const items = [
    ...articles.map((item) => ({
      id: item.id,
      href: `/articles/${item.id}`,
      title: item.title,
      summary: item.summary,
      date: item.updatedAt,
      label: item.subcategory?.name ?? item.category?.name ?? "圖文解說",
      type: "article" as const,
      keywords: item.keywords
    })),
    ...reports.map((item) => ({
      id: item.id,
      href: `/reports/${item.id}`,
      title: item.title,
      summary: item.summary,
      date: item.updatedAt,
      label: item.subcategory?.name ?? item.category?.name ?? "醫學新知",
      type: "report" as const,
      keywords: item.keywords
    })),
    ...lessons.map((item) => ({
      id: item.id,
      href: `/teaching/lessons/${item.id}`,
      title: item.title,
      summary: item.summary,
      date: item.updatedAt,
      label: item.topic.title,
      type: "teaching" as const,
      keywords: item.keywords
    })),
    ...pdfs.map((item) => ({
      id: item.id,
      href: `/pdfs/${item.slug}`,
      title: item.title,
      summary: item.description,
      date: item.updatedAt,
      label: item.subcategory?.name ?? item.category?.name ?? "PDF",
      type: "pdf" as const,
      keywords: item.keywords
    }))
  ]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 6);

  if (items.length === 0) return null;

  return (
    <section className="mt-12 border-t border-border pt-10 print:hidden">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="section-title">相關內容</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <ContentCard
            key={`${item.type}-${item.id}`}
            href={item.href}
            title={item.title}
            summary={item.summary}
            date={item.date}
            label={item.label}
            type={item.type}
            keywords={item.keywords}
          />
        ))}
      </div>
    </section>
  );
}
