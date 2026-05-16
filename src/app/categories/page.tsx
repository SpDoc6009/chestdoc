import Link from "next/link";
import { FolderTree, Layers, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "疾病分類"
};

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: {
      subcategories: {
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        include: {
          _count: {
            select: { articles: true, htmlReports: true, pdfDocuments: true }
          }
        }
      },
      _count: {
        select: { articles: true, htmlReports: true, pdfDocuments: true }
      }
    }
  });

  return (
    <>
      <section className="relative overflow-hidden border-b border-border bg-white">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-blue-50/70 to-slate-50" aria-hidden="true" />
        <div className="section-shell relative flex min-h-[260px] items-center py-10">
          <div className="max-w-2xl">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-primary">
              <FolderTree className="h-6 w-6" aria-hidden="true" />
            </div>
            <p className="text-sm font-semibold text-primary">Pulmonary Knowledge Map</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-normal text-slate-950 sm:text-4xl">胸腔知識地圖</h1>
            <p className="mt-4 max-w-2xl leading-7 text-muted-foreground">
              以疾病與主題分類整理圖文解說、醫學新知與 PDF 文件，從一個入口找到相關內容。
            </p>
          </div>
        </div>
      </section>

      <main className="section-shell py-10">
      <div className="grid gap-5 lg:grid-cols-2">
        {categories.map((category) => (
          <Card key={category.id} className="overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md">
            <div className="h-1.5 bg-gradient-to-r from-blue-700 via-sky-500 to-cyan-400" aria-hidden="true" />
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <CardTitle className="flex items-center gap-2">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-blue-50 text-primary">
                    <Layers className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span>{category.name}</span>
                </CardTitle>
                <Link
                  href={`/search?q=${encodeURIComponent(category.name)}`}
                  className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-1 text-xs font-semibold text-primary hover:bg-blue-100"
                >
                  <Search className="h-3.5 w-3.5" aria-hidden="true" />
                  搜尋
                </Link>
              </div>
              {category.description ? <p className="text-sm leading-6 text-muted-foreground">{category.description}</p> : null}
            </CardHeader>
            <CardContent>
              <div className="mb-4 grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-md bg-sky-50 px-2 py-2 text-sky-800">
                  <div className="text-base font-semibold">{category._count.articles}</div>
                  圖文
                </div>
                <div className="rounded-md bg-indigo-50 px-2 py-2 text-indigo-800">
                  <div className="text-base font-semibold">{category._count.htmlReports}</div>
                  新知
                </div>
                <div className="rounded-md bg-slate-100 px-2 py-2 text-slate-700">
                  <div className="text-base font-semibold">{category._count.pdfDocuments}</div>
                  PDF
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {category.subcategories.map((subcategory) => (
                  <Link
                    key={subcategory.id}
                    href={`/search?q=${encodeURIComponent(subcategory.name)}`}
                    className="rounded-md border border-blue-100 bg-blue-50 px-3 py-1.5 text-sm text-blue-900 hover:bg-blue-100"
                  >
                    {subcategory.name}
                  </Link>
                ))}
                {category.subcategories.length === 0 ? (
                  <span className="text-sm text-muted-foreground">尚未建立小分類。</span>
                ) : null}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
    </>
  );
}
