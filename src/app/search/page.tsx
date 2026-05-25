import Link from "next/link";
import { SearchBox } from "@/components/search-box";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

type SearchParams = Promise<{ q?: string; type?: string }>;
type SearchType = "all" | "reports" | "articles" | "education" | "teaching" | "pdfs" | "links";
type SearchResult = {
  id: string;
  href: string;
  title: string;
  summary?: string | null;
  type: string;
  kind: SearchType;
  accent: string;
  external?: boolean;
  keywords?: string[];
};

const searchFilters: { value: SearchType; label: string }[] = [
  { value: "all", label: "全部" },
  { value: "reports", label: "醫學新知" },
  { value: "articles", label: "圖文解說" },
  { value: "education", label: "衛教園區" },
  { value: "teaching", label: "教學筆記" },
  { value: "pdfs", label: "PDF" },
  { value: "links", label: "常用連結" }
];

export const metadata = {
  title: "搜尋"
};

function keywordTerms(query: string) {
  return query
    .split(/[#,\s，]+/)
    .map((term) => term.trim().toLowerCase())
    .filter(Boolean);
}

export default async function SearchPage({ searchParams }: { searchParams: SearchParams }) {
  const { q = "", type = "all" } = await searchParams;
  const query = q.trim();
  const activeType = searchFilters.some((item) => item.value === type) ? (type as SearchType) : "all";
  const terms = keywordTerms(query);
  const keywordFilters = terms.map((term) => ({ keywords: { has: term } }));

  const [articles, reports, teachingLessons, pdfs, links] = query
    ? await Promise.all([
        prisma.article.findMany({
          where: {
            isPublished: true,
            OR: [
              { title: { contains: query, mode: "insensitive" } },
              { summary: { contains: query, mode: "insensitive" } },
              { content: { contains: query, mode: "insensitive" } },
              ...keywordFilters
            ]
          },
          orderBy: { updatedAt: "desc" },
          take: 20
        }),
        prisma.htmlReport.findMany({
          where: {
            isPublished: true,
            OR: [
              { title: { contains: query, mode: "insensitive" } },
              { summary: { contains: query, mode: "insensitive" } },
              { htmlContent: { contains: query, mode: "insensitive" } },
              ...keywordFilters
            ]
          },
          orderBy: { updatedAt: "desc" },
          take: 20
        }),
        prisma.teachingLesson.findMany({
          where: {
            isPublished: true,
            OR: [
              { title: { contains: query, mode: "insensitive" } },
              { summary: { contains: query, mode: "insensitive" } },
              { markdownContent: { contains: query, mode: "insensitive" } },
              { htmlContent: { contains: query, mode: "insensitive" } },
              ...keywordFilters
            ]
          },
          orderBy: { updatedAt: "desc" },
          take: 20
        }),
        prisma.pdfDocument.findMany({
          where: {
            isPublished: true,
            OR: [
              { title: { contains: query, mode: "insensitive" } },
              { description: { contains: query, mode: "insensitive" } },
              ...keywordFilters
            ]
          },
          orderBy: { updatedAt: "desc" },
          take: 20
        }),
        prisma.usefulLink.findMany({
          where: {
            OR: [
              { title: { contains: query, mode: "insensitive" } },
              { description: { contains: query, mode: "insensitive" } },
              { group: { contains: query, mode: "insensitive" } }
            ]
          },
          orderBy: [{ isFavorite: "desc" }, { sortOrder: "asc" }],
          take: 20
        })
      ])
    : [[], [], [], [], []];

  const results: SearchResult[] = [
    ...articles.map((item) => ({
      id: item.id,
      href: `/articles/${item.slug}`,
      title: item.title,
      summary: item.summary,
      type: "圖文解說",
      kind: (item.keywords.includes("衛教") || item.keywords.includes("patient-education") ? "education" : "articles") as SearchType,
      accent: "from-sky-500 to-cyan-400",
      keywords: item.keywords
    })),
    ...reports.map((item) => ({
      id: item.id,
      href: `/reports/${item.slug}`,
      title: item.title,
      summary: item.summary,
      type: "醫學新知",
      kind: "reports" as SearchType,
      accent: "from-indigo-500 to-blue-400",
      keywords: item.keywords
    })),
    ...teachingLessons.map((item) => ({
      id: item.id,
      href: `/teaching/lessons/${item.slug}`,
      title: item.title,
      summary: item.summary,
      type: "教學筆記",
      kind: "teaching" as SearchType,
      accent: "from-amber-400 to-sky-400",
      keywords: item.keywords
    })),
    ...pdfs.map((item) => ({
      id: item.id,
      href: `/pdfs/${item.slug}`,
      title: item.title,
      summary: item.description,
      type: "PDF",
      kind: "pdfs" as SearchType,
      accent: "from-slate-500 to-blue-400",
      keywords: item.keywords
    })),
    ...links.map((item) => ({
      id: item.id,
      href: item.url,
      title: item.title,
      summary: item.description,
      type: item.group,
      kind: "links" as SearchType,
      accent: "from-emerald-500 to-cyan-400",
      external: true
    }))
  ];
  const filteredResults = activeType === "all" ? results : results.filter((result) => result.kind === activeType);
  const resultCounts = searchFilters.reduce<Record<SearchType, number>>((counts, filter) => {
    counts[filter.value] = filter.value === "all" ? results.length : results.filter((result) => result.kind === filter.value).length;
    return counts;
  }, {} as Record<SearchType, number>);

  function filterHref(typeValue: SearchType) {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (typeValue !== "all") params.set("type", typeValue);
    const queryString = params.toString();
    return `/search${queryString ? `?${queryString}` : ""}`;
  }

  return (
    <main className="section-shell py-10">
      <h1 className="text-3xl font-semibold tracking-normal">搜尋</h1>
      <p className="mt-3 max-w-3xl text-muted-foreground">
        可搜尋標題、摘要、內文，也可以輸入關鍵字，例如 guideline、COPD、ILD，找出分散在不同分類的相關內容。
      </p>
      <div className="mt-6 max-w-3xl">
        <SearchBox defaultValue={query} />
      </div>
      {query ? (
        <div className="mt-6 flex flex-wrap gap-2">
          {searchFilters.map((filter) => {
            const isActive = filter.value === activeType;
            return (
              <Link
                key={filter.value}
                href={filterHref(filter.value)}
                className={`rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "border-blue-200 bg-blue-50 text-primary"
                    : "border-border bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50"
                }`}
              >
                {filter.label}
                <span className="ml-1 text-xs text-muted-foreground">{resultCounts[filter.value]}</span>
              </Link>
            );
          })}
        </div>
      ) : null}
      <div className="mt-8 space-y-4">
        {query && filteredResults.length === 0 ? <p className="text-muted-foreground">找不到與「{query}」相關的內容。</p> : null}
        {filteredResults.map((result) => (
          <Card key={`${result.type}-${result.id}`} className="overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md">
            <div className={`h-1.5 bg-gradient-to-r ${result.accent}`} aria-hidden="true" />
            <CardHeader className="pb-3">
              <div className="mb-2 flex flex-wrap gap-2">
                <Badge>{result.type}</Badge>
                {result.keywords?.map((keyword) => (
                  <Badge key={keyword} className="border-slate-200 bg-white text-slate-600">
                    #{keyword}
                  </Badge>
                ))}
              </div>
              <CardTitle className="text-lg">
                <Link
                  href={result.href}
                  target={result.external ? "_blank" : undefined}
                  rel={result.external ? "noreferrer" : undefined}
                  className="hover:text-primary"
                >
                  {result.title}
                </Link>
              </CardTitle>
            </CardHeader>
            {result.summary ? <CardContent className="text-sm leading-6 text-muted-foreground">{result.summary}</CardContent> : null}
          </Card>
        ))}
      </div>
    </main>
  );
}
