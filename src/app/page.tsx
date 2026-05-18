import Image from "next/image";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BookOpen,
  Clock3,
  ExternalLink,
  FileText,
  FolderTree,
  HeartPulse,
  Stethoscope
} from "lucide-react";
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
    color: "bg-[#dce6de] text-[#2b4c40] border-[#c4d6c3]"
  },
  {
    href: "/education",
    title: "我想看衛教",
    description: "用病人與家屬更容易理解的方式整理照護重點。",
    icon: HeartPulse,
    color: "bg-[#f5d0cc] text-[#8e5551] border-[#e9bcb7]"
  },
  {
    href: "/reports",
    title: "我想看醫學新知",
    description: "整理胸腔醫學新知、研究摘要與 AI 輔助筆記。",
    icon: Activity,
    color: "bg-[#d9e7ea] text-[#5b778e] border-[#bfd3d8]"
  },
  {
    href: "/pdfs",
    title: "我想找 PDF 指南",
    description: "快速找到指南、表格、講義與臨床速查文件。",
    icon: FileText,
    color: "bg-[#fdd8bb] text-[#8a5c38] border-[#efc5a3]"
  }
];

const chapterCards = [
  {
    title: "圖文解說",
    description: "用圖文筆記整理 COPD、氣喘、肺炎、肋膜疾病與間質性肺病的核心概念。",
    href: "/articles",
    icon: BookOpen,
    image: "/images/article-visual-hero.png",
    accent: "from-[#5b778e]/72 to-[#5b778e]/20"
  },
  {
    title: "衛教園區",
    description: "把檢查、治療、居家照護與回診資訊寫成病人與家屬比較容易吸收的版本。",
    href: "/education",
    icon: HeartPulse,
    image: "/images/patient-education-hero.png",
    accent: "from-[#e79e90]/72 to-[#e79e90]/18"
  },
  {
    title: "醫學新知",
    description: "收藏胸腔醫學新知、臨床研究摘要與 AI 輔助整理的互動式 HTML 報告。",
    href: "/reports",
    icon: Activity,
    image: "/images/medical-news-hero.png",
    accent: "from-[#2b4c40]/76 to-[#2b4c40]/18"
  },
  {
    title: "PDF 文件庫",
    description: "集中管理臨床指南、速查表、教學講義與重要文件，方便快速閱讀。",
    href: "/pdfs",
    icon: FileText,
    image: "/images/teaching-hero.png",
    accent: "from-[#28675b]/74 to-[#28675b]/18"
  }
];

const pageSections = [
  { id: "quick-search", label: "快速搜尋" },
  { id: "quick-links", label: "我想找..." },
  { id: "recent-updates", label: "最新更新" },
  { id: "education-section", label: "衛教園區" },
  { id: "articles-section", label: "圖文解說" },
  { id: "reports-section", label: "醫學新知" },
  { id: "teaching-section", label: "教學筆記" },
  { id: "pdfs-section", label: "PDF 文件" }
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

function HomeMobileNav() {
  return (
    <nav className="mb-6 flex gap-2 overflow-x-auto pb-2 lg:hidden" aria-label="首頁導覽">
      {pageSections.map((item, index) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full border border-[#ded8ca] bg-[#fffdf7] px-4 text-sm font-semibold text-[#4d5a53] shadow-sm"
        >
          <span className="grid h-6 w-6 place-items-center rounded-full bg-[#e9e5dc] text-xs">{index + 1}</span>
          {item.label}
        </a>
      ))}
    </nav>
  );
}

function HomeSidebarNav() {
  return (
    <aside className="hidden rounded-[2rem] border border-[#efc7b5] bg-[#F9D9CA] p-5 shadow-sm lg:sticky lg:top-24 lg:block lg:self-start">
      <p className="text-sm font-semibold text-[#6a716c]">網站導覽</p>
      <nav className="mt-5 space-y-3 text-sm">
        {pageSections.map((item, index) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className="flex items-center gap-3 rounded-full px-2 py-1.5 text-[#4d5a53] transition-colors hover:bg-[#f2eee5]"
          >
            <span className="grid h-9 w-9 place-items-center rounded-full bg-[#e9e5dc] text-sm font-semibold text-[#5c665f] shadow-inner">
              {index + 1}
            </span>
            <span className="text-base font-medium">{item.label}</span>
          </a>
        ))}
      </nav>
    </aside>
  );
}

function SectionHeading({
  eyebrow,
  title,
  href,
  linkLabel
}: {
  eyebrow?: string;
  title: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        {eyebrow ? <p className="text-sm font-semibold text-[#28675b]">{eyebrow}</p> : null}
        <h2 className="mt-2 text-3xl font-semibold tracking-normal text-[#1f2623]">{title}</h2>
      </div>
      {href && linkLabel ? (
        <Link href={href} className="shrink-0 rounded-full border border-[#ded8ca] bg-[#fffdf7] px-4 py-2 text-sm font-semibold text-[#28675b] shadow-sm hover:bg-[#f2eee5]">
          {linkLabel}
        </Link>
      ) : null}
    </div>
  );
}

function ChapterCard({ card }: { card: (typeof chapterCards)[number] }) {
  const Icon = card.icon;
  return (
    <Link
      href={card.href}
      className="group overflow-hidden rounded-[2rem] border border-[#ded8ca] bg-[#fffdf7] shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative h-48">
        <Image src={card.image} alt="" fill sizes="50vw" className="object-cover" />
        <div className={`absolute inset-0 bg-gradient-to-t ${card.accent}`} aria-hidden="true" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#fffdf7]/18 via-transparent to-[#fffdf7]/42" aria-hidden="true" />
        <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4">
          <div>
            <span className="mb-4 grid h-12 w-12 place-items-center rounded-full border border-[#2b4c40]/35 bg-[#fffdf7]/96 text-[#2b4c40] shadow-md backdrop-blur">
              <Icon className="h-6 w-6" aria-hidden="true" />
            </span>
            <h3 className="inline-block rounded-full border border-[#2b4c40]/35 bg-[#fffdf7]/96 px-4 py-2 text-xl font-semibold tracking-normal text-[#1f2623] shadow-md backdrop-blur">
              {card.title}
            </h3>
          </div>
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#2b4c40]/35 bg-[#fffdf7]/96 text-[#2b4c40] shadow-md backdrop-blur">
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </span>
        </div>
      </div>
      <div className="p-5">
        <p className="text-sm leading-7 text-[#5c665f]">{card.description}</p>
      </div>
    </Link>
  );
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
    <main className="bg-[#f7f4ec] text-[#1f2623]">
      <section className="relative overflow-hidden border-b border-[#ded8ca] bg-[#f7f4ec]">
        <Image
          src="/images/lung-main.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-right opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#f7f4ec] via-[#f7f4ec]/92 to-[#f7f4ec]/30" aria-hidden="true" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#f7f4ec]/15 via-transparent to-[#f7f4ec]/65" aria-hidden="true" />
        <div className="section-shell relative flex min-h-[620px] items-center py-12 lg:py-16">
          <div className="max-w-4xl">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#ded8ca] bg-[#fffdf7] px-5 py-2.5 text-sm font-medium text-[#5c665f] shadow-sm">
              <Stethoscope className="h-4 w-4 text-[#28675b]" aria-hidden="true" />
              Pulmonary Medicine Notebook
            </div>
            <h1 className="max-w-4xl text-3xl font-semibold leading-[1.35] tracking-normal text-[#7A848D] sm:text-4xl lg:text-5xl">
              胸腔重症間，陪你找回自然的呼吸
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#5c665f]">
              胸腔科醫學筆記、指南整理、AI 深度研究報告、衛教資料整理
            </p>
            <div id="quick-search" className="mt-8 max-w-2xl scroll-mt-24">
              <SearchBox />
            </div>
            <div
              id="quick-links"
              className="mt-10 max-w-3xl scroll-mt-24 rounded-[2rem] border border-[#6fa2b1] p-6 shadow-lg backdrop-blur"
              style={{ background: "linear-gradient(135deg, rgba(71, 139, 162, 0.94), rgba(111, 168, 181, 0.9), rgba(178, 197, 198, 0.86))" }}
            >
              <p className="text-xl font-semibold text-[#f7f4ec]">以問題開始</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {quickLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`group flex items-center justify-between gap-4 rounded-full border px-5 py-3.5 shadow-sm transition-transform hover:-translate-y-0.5 ${item.color}`}
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                        <span className="text-base font-semibold">{item.title}</span>
                      </span>
                      <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {!homeData ? (
        <section className="section-shell py-10">
          <div className="rounded-[2rem] border border-amber-200 bg-amber-50 p-5 text-sm leading-7 text-amber-900">
            網站內容資料庫暫時無法連線。請稍後再試，或聯絡網站管理者確認資料庫設定。
          </div>
        </section>
      ) : null}

      <section className="section-shell py-12">
        <HomeMobileNav />
        <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
          <HomeSidebarNav />
          <div className="space-y-10">
            <section id="recent-updates" className="scroll-mt-24">
              <SectionHeading eyebrow="Recent Updates" title="最新更新" href="/search" linkLabel="搜尋更多" />
              <div className="rounded-[2rem] border border-[#bfd0ad] bg-[#d4dfc7] p-4 shadow-sm">
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {recentUpdates.map((item) => (
                    <Link
                      key={`${item.type}-${item.href}`}
                      href={item.href}
                      className="group flex gap-3 rounded-[1.5rem] border border-transparent p-3 transition-colors hover:border-[#c4d6c3] hover:bg-[#f2eee5]"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e9e5dc] text-[#28675b]">
                        <Clock3 className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <span className="min-w-0">
                        <span className="mb-1 flex flex-wrap items-center gap-2 text-xs text-[#6a716c]">
                          <span>{item.type}</span>
                          <span>{formatDate(item.date)}</span>
                        </span>
                        <span className="line-clamp-2 text-sm font-medium leading-6 text-[#1f2623] group-hover:text-[#28675b]">{item.title}</span>
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

              {popularKeywords.length > 0 ? (
                <div className="mt-8">
                  <h3 className="mb-4 text-lg font-semibold text-[#1f2623]">熱門關鍵字</h3>
                  <div className="flex flex-wrap gap-2">
                    {popularKeywords.map((item) => (
                      <Link
                        key={item.keyword}
                        href={`/search?q=${encodeURIComponent(item.keyword)}`}
                        className="rounded-full border border-[#ded8ca] bg-[#fffdf7] px-3 py-2 text-sm font-medium text-[#4d5a53] shadow-sm transition-colors hover:bg-[#f2eee5] hover:text-[#28675b]"
                      >
                        #{item.keyword}
                        <span className="ml-2 text-xs text-[#6a716c]">{item.count}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}
            </section>

            <section className="scroll-mt-24">
              <SectionHeading eyebrow="Start Here" title="先選你現在需要的資訊" />
              <div className="grid gap-4 md:grid-cols-2">
                {chapterCards.map((card) => (
                  <ChapterCard key={card.title} card={card} />
                ))}
              </div>
            </section>

            {educationArticles.length > 0 ? (
              <section id="education-section" className="scroll-mt-24">
                <SectionHeading eyebrow="Patient Education" title="衛教園區" href="/education" linkLabel="全部衛教" />
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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
              </section>
            ) : null}

            <section id="articles-section" className="scroll-mt-24">
              <SectionHeading eyebrow="Visual Notes" title="圖文解說" href="/articles" linkLabel="全部圖文" />
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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

            <section id="reports-section" className="scroll-mt-24">
              <SectionHeading eyebrow="Medical Updates" title="醫學新知" href="/reports" linkLabel="全部新知" />
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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
            </section>

            <section id="teaching-section" className="scroll-mt-24">
              <SectionHeading eyebrow="Teaching" title="教學筆記" href="/teaching" linkLabel="全部教學" />
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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
            </section>

            <section id="pdfs-section" className="scroll-mt-24">
              <SectionHeading eyebrow="Documents" title="PDF 文件" href="/pdfs" linkLabel="文件庫" />
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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
            </section>

            <section className="scroll-mt-24">
              <SectionHeading eyebrow="Useful Links" title="常用網站連結" href="/links" linkLabel="全部連結" />
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {links.map((link) => (
                  <Card key={link.id} className="overflow-hidden rounded-[2rem] border-[#ded8ca] bg-[#fffdf7] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                    <div className="h-1.5 bg-gradient-to-r from-[#28675b] to-[#478ba2]" aria-hidden="true" />
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">
                        <a href={link.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-[#28675b]">
                          {link.title}
                          <ExternalLink className="h-4 w-4" aria-hidden="true" />
                        </a>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm leading-6 text-[#5c665f]">
                      {link.description ?? link.group}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
