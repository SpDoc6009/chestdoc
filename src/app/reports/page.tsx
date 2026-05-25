import Image from "next/image";
import { ContentCard } from "@/components/content-card";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "醫學新知"
};

export default async function ReportsPage() {
  const reports = await prisma.htmlReport.findMany({
    where: { isPublished: true },
    orderBy: { updatedAt: "desc" },
    include: { category: true, subcategory: true }
  });

  return (
    <>
      <section className="relative overflow-hidden border-b border-border bg-white">
        <Image
          src="/images/medical-news-hero.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-right opacity-85"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/92 to-white/20" aria-hidden="true" />
        <div className="section-shell relative flex min-h-[300px] items-center py-10">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-primary">Medical Updates</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-normal text-slate-950 sm:text-4xl">醫學新知筆記</h1>
            <p className="mt-4 leading-7 text-muted-foreground">
              這裡記錄著胸腔醫學新知及 AI 輔助筆記
            </p>
          </div>
        </div>
      </section>
      <main className="section-shell py-10">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {reports.map((report) => (
            <ContentCard
              key={report.id}
              href={`/r/${report.id}`}
              title={report.title}
            summary={report.summary}
            date={report.updatedAt}
            label={report.subcategory?.name ?? report.category?.name ?? "醫學新知"}
            type="report"
            keywords={report.keywords}
          />
          ))}
        </div>
      </main>
    </>
  );
}
