import Image from "next/image";
import { ContentCard } from "@/components/content-card";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "圖文解說"
};

export default async function ArticlesPage() {
  const articles = await prisma.article.findMany({
    where: { isPublished: true },
    orderBy: { updatedAt: "desc" },
    include: { category: true, subcategory: true }
  });

  return (
    <>
      <section className="relative overflow-hidden border-b border-border bg-white">
        <Image
          src="/images/article-visual-hero.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-right opacity-85"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/92 to-white/20" aria-hidden="true" />
        <div className="section-shell relative flex min-h-[300px] items-center py-10">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-primary">Visual Clinical Notes</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-normal text-slate-950 sm:text-4xl">圖文解說</h1>
            <p className="mt-4 leading-7 text-muted-foreground">依疾病、檢查、治療與指南整理的胸腔科圖文筆記。</p>
          </div>
        </div>
      </section>
      <main className="section-shell py-10">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <ContentCard
              key={article.id}
              href={`/articles/${article.id}`}
              title={article.title}
            summary={article.summary}
            date={article.updatedAt}
            label={article.subcategory?.name ?? article.category?.name ?? "圖文解說"}
            type="article"
            keywords={article.keywords}
          />
          ))}
        </div>
      </main>
    </>
  );
}
