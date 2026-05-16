import Link from "next/link";
import { Activity, ArrowRight, Clock3, ExternalLink, FileText, FolderTree, HeartPulse } from "lucide-react";
import { ContentCard } from "@/components/content-card";
import { SearchBox } from "@/components/search-box";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

const quickLinks = [
  {
    href: "/categories",
    title: "我想找疾病",
    description: "依胸腔疾病分類查找筆記、指南與相關內容。",
    icon: FolderTree,
    accent: "from-blue-600 to-sky-400",
    bg: "bg-blue-50 text-blue-700"
  },
  {
    href: "/education",
    title: "我想看衛教",
    description: "用病人與家屬更容易理解的方式整理照護重點。",
    icon: HeartPulse,
    accent: "from-cyan-500 to-emerald-400",
    bg: "bg-cyan-50 text-cyan-700"
  },
  {
    href: "/reports",
    title: "我想看醫學新知",
    description: "整理胸腔醫學新知、研究摘要與 AI 輔助筆記。",
    icon: Activity,
    accent: "from-indigo-600 to-blue-400",
    bg: "bg-indigo-50 text-indigo-700"
  },
  {
    href: "/pdfs",
    title: "我想找 PDF 指南",
    description: "快速找到指南、表格、講義與臨床速查文件。",
    icon: FileText,
    accent: "from-slate-600 to-blue-400",
    bg: "bg-slate-100 text-slate-700"
  }
];

async function getHomeData() {
  const [articles, educationArticles, reports, teachingLessons, pdfs, links, keywordArticles, keywordReports, keywordLessons, keywordPdfs] = await Promise.all([
    prisma.article.findMany({
      where: { isPublished: true },
      orderBy: [{ isFeatured: "desc" }, { updatedAt: "desc" }],
      take: 6,
      include: { category: true }
    }),
    prisma.article.findMany({
      where: {
        isPublished: true,
        OR: [
          { title: { contains: "衛教", mode: "insensitive" } },
          { summary: { contains: "衛教", mode: "insensitive" } },
          { content: { contains: "衛教", mode: "insensitive" } },
          { keywords: { has: "衛教" } },
          { keywords: { has: "patient-education" } }
        ]
      },
      orderBy: { updatedAt: "desc" },
      take: 3,
      include: { category: true, subcategory: true }
    }),
    prisma.htmlReport.findMany({
      where: { isPublished: true },
      orderBy: { updatedAt: "desc" },
      take: 3,
      include: { category: true }
    }),
    prisma.teachingLesson.findMany({
      where: { isPublished: true },
      orderBy: [{ isFeatured: "desc" }, { updatedAt: "desc" }],
      take: 3,
      include: { topic: true }
    }),
    prisma.pdfDocument.findMany({
      where: { isPublished: true },
      orderBy: { updatedAt: "desc" },
      take: 3,
      include: { category: true }
    }),
    prisma.usefulLink.findMany({
      orderBy: [{ isFavorite: "desc" }, { sortOrder: "asc" }, { title: "asc" }],
      take: 8
    }),
    prisma.article.findMany({
      where: { isPublished: true },
      select: { keywords: true },
      take: 80
    }),
    prisma.htmlReport.findMany({
      where: { isPublished: true },
      select: { keywords: true },
      take: 80
    }),
    prisma.teachingLesson.findMany({
      where: { isPublished: true },
      select: { keywords: true },
      take: 80
    }),
    prisma.pdfDocument.findMany({
      where: { isPublished: true },
      select: { keywords: true },
      take: 80
    })
  ]);

  const keywordCounts = new Map<string, number>();
  for (const item of [...keywordArticles, ...keywordReports, ...keywordLessons, ...keywordPdfs]) {
    for (const keyword of item.keywords) {
      keywordCounts.set(keyword, (keywordCounts.get(keyword) ?? 0) + 1);
    }
  }
  const popularKeywords = [...keywordCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([keyword, count]) => ({ keyword, count }));

  return { articles, educationArticles, reports, teachingLessons, pdfs, links, popularKeywords };
}

export default async function HomePage() {
  const homeData = await getHomeData().catch((error) => {
    console.error("Failed to load home data", error);
    return null;
  });
  const { articles, educationArticles, reports, teachingLessons, pdfs, links, popularKeywords } = homeData ?? {
    articles: [],
    educationArticles: [],
    reports: [],
    teachingLessons: [],
    pdfs: [],
    links: [],
    popularKeywords: []
  };
  const recentUpdates = [
    ...articles.slice(0, 3).map((item) => ({ title: item.title, href: `/articles/${item.id}`, date: item.updatedAt, type: "圖文解說" })),
    ...reports.slice(0, 3).map((item) => ({ title: item.title, href: `/reports/${item.slug}`, date: item.updatedAt, type: "醫學新知" })),
    ...teachingLessons.slice(0, 2).map((item) => ({ title: item.title, href: `/teaching/lessons/${item.id}`, date: item.updatedAt, type: "教學筆記" })),
    ...pdfs.slice(0, 2).map((item) => ({ title: item.title, href: `/pdfs/${item.slug}`, date: item.updatedAt, type: "PDF" }))
  ]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 6);

  return (
    <main>
      <section className="relative overflow-hidden border-b border-border bg-white">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/images/lung-main.png')" }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-white/15" aria-hidden="true" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/35" aria-hidden="true" />
        <div className="section-shell relative flex min-h-[520px] items-center py-14 lg:py-18">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold text-primary">Pulmonary Medicine Notebook</p>
            <h1 className="hero-hand-title mt-4 text-4xl text-slate-950 sm:text-5xl">
              在胸腔重症裡，陪你找回自然的呼吸
            </h1>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              胸腔科醫學筆記、指南整理、AI 深度研究報告、衛教資料整理
            </p>
            <div className="mt-8 max-w-2xl">
              <SearchBox />
            </div>
            <div className="mt-6 grid max-w-4xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {quickLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group overflow-hidden rounded-lg border border-border bg-white/88 shadow-sm backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-white hover:shadow-md"
                  >
                    <div className={`h-1 bg-gradient-to-r ${item.accent}`} aria-hidden="true" />
                    <div className="p-4">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <span className={`flex h-10 w-10 items-center justify-center rounded-md ${item.bg}`}>
                          <Icon className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <ArrowRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-primary" aria-hidden="true" />
                      </div>
                      <h2 className="text-base font-semibold text-slate-950">{item.title}</h2>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {!homeData ? (
        <section className="section-shell py-10">
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm leading-7 text-amber-900">
            網站內容資料庫暫時無法連線。請稍後再試，或聯絡網站管理者確認資料庫設定。
          </div>
        </section>
      ) : null}

      <section className="section-shell py-10">
        {popularKeywords.length > 0 ? (
          <div className="mb-10">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="section-title">熱門關鍵字</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {popularKeywords.map((item) => (
                <Link
                  key={item.keyword}
                  href={`/search?q=${encodeURIComponent(item.keyword)}`}
                  className="rounded-md border border-blue-100 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-blue-50 hover:text-primary"
                >
                  #{item.keyword}
                  <span className="ml-2 text-xs text-muted-foreground">{item.count}</span>
                </Link>
              ))}
            </div>
          </div>
        ) : null}
        <div className="mb-5 flex items-center justify-between">
          <h2 className="section-title">最近更新</h2>
          <Link href="/search" className="text-sm font-medium text-primary hover:underline">搜尋更多</Link>
        </div>
        <div className="rounded-lg border border-border bg-white/88 p-4 shadow-sm backdrop-blur">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {recentUpdates.map((item) => (
              <Link
                key={`${item.type}-${item.href}`}
                href={item.href}
                className="group flex gap-3 rounded-lg border border-transparent p-3 transition-colors hover:border-blue-100 hover:bg-blue-50/70"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-blue-50 text-primary">
                  <Clock3 className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="mb-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span>{item.type}</span>
                    <span>{formatDate(item.date)}</span>
                  </span>
                  <span className="line-clamp-2 text-sm font-medium leading-6 text-slate-800 group-hover:text-primary">{item.title}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell py-10">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="section-title">最新圖文解說</h2>
          <Link href="/articles" className="text-sm font-medium text-primary hover:underline">全部圖文</Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <ContentCard
              key={article.id}
              href={`/articles/${article.id}`}
              title={article.title}
              summary={article.summary}
              date={article.updatedAt}
              label={article.category?.name ?? "圖文解說"}
              type="article"
              keywords={article.keywords}
            />
          ))}
        </div>
      </section>

      {educationArticles.length > 0 ? (
        <section className="medical-panel">
          <div className="section-shell py-10">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="section-title">最新衛教資料</h2>
              <Link href="/education" className="text-sm font-medium text-primary hover:underline">衛教園區</Link>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {educationArticles.map((article) => (
                <ContentCard
                  key={article.id}
                  href={`/articles/${article.id}`}
                  title={article.title}
                  summary={article.summary}
                  date={article.updatedAt}
                  label="衛教資料"
                  type="article"
                  keywords={article.keywords}
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="medical-panel">
        <div className="section-shell grid gap-8 py-10 lg:grid-cols-3">
          <div>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="section-title">醫學新知</h2>
              <Link href="/reports" className="text-sm font-medium text-primary hover:underline">全部新知</Link>
            </div>
            <div className="grid gap-4">
              {reports.map((report) => (
                <ContentCard
                  key={report.id}
                  href={`/reports/${report.slug}`}
                  title={report.title}
                  summary={report.summary}
                  date={report.updatedAt}
                  label={report.category?.name ?? "醫學新知"}
                  type="report"
                  keywords={report.keywords}
                />
              ))}
            </div>
          </div>
          <div>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="section-title">教學筆記</h2>
              <Link href="/teaching" className="text-sm font-medium text-primary hover:underline">全部教學</Link>
            </div>
            <div className="grid gap-4">
              {teachingLessons.map((lesson) => (
                <ContentCard
                  key={lesson.id}
                  href={`/teaching/lessons/${lesson.id}`}
                  title={lesson.title}
                  summary={lesson.summary}
                  date={lesson.updatedAt}
                  label={lesson.topic.title}
                  type="teaching"
                  keywords={lesson.keywords}
                />
              ))}
            </div>
          </div>
          <div>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="section-title">最新 PDF 文件</h2>
              <Link href="/pdfs" className="text-sm font-medium text-primary hover:underline">文件庫</Link>
            </div>
            <div className="grid gap-4">
              {pdfs.map((pdf) => (
                <ContentCard
                  key={pdf.id}
                  href={`/pdfs/${pdf.slug}`}
                  title={pdf.title}
                  summary={pdf.description}
                  date={pdf.updatedAt}
                  label={pdf.category?.name ?? "PDF"}
                  type="pdf"
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell py-10">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="section-title">常用網站連結</h2>
          <Link href="/links" className="text-sm font-medium text-primary hover:underline">全部連結</Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {links.map((link) => (
            <Card key={link.id} className="overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md">
              <div className="h-1.5 bg-gradient-to-r from-emerald-500 to-cyan-400" aria-hidden="true" />
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  <a href={link.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-primary">
                    {link.title}
                    <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  </a>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-6 text-muted-foreground">
                {link.description ?? link.group}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
