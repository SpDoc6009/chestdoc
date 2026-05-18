import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PrintButton } from "@/components/print-button";
import { Card, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { createQrSvg } from "@/lib/qr-code";
import { getSiteUrl } from "@/lib/site-url";

export const metadata = {
  title: "胸腔醫學衛教資料"
};

function idsFromSearchParams(ids?: string | string[]) {
  const values = Array.isArray(ids) ? ids : ids ? [ids] : [];
  return values
    .flatMap((value) => value.split(","))
    .map((value) => value.trim())
    .filter(Boolean);
}

function qrSvg(url: string) {
  try {
    return createQrSvg(url, { quietZone: 3, cellSize: 2 });
  } catch {
    return "";
  }
}

export default async function PublicEducationQrPrintPage({
  searchParams
}: {
  searchParams: Promise<{ ids?: string | string[] }>;
}) {
  const { ids } = await searchParams;
  const selectedIds = idsFromSearchParams(ids);
  const siteUrl = getSiteUrl();

  const articles = selectedIds.length
    ? await prisma.article.findMany({
        where: {
          id: { in: selectedIds },
          isPublished: true
        },
        orderBy: { title: "asc" },
        select: {
          id: true,
          title: true
        }
      })
    : [];

  return (
    <main className="section-shell py-10">
      <div className="print:hidden mb-6 flex flex-wrap items-center gap-3">
        <Link
          href="/education/qr"
          className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-white px-4 text-sm font-medium text-slate-700 hover:bg-blue-50"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          返回勾選清單
        </Link>
        {articles.length > 0 ? <PrintButton /> : null}
      </div>

      {articles.length > 0 ? (
        <section>
          <div className="mb-5 text-center print:mb-4">
            <h1 className="text-3xl font-semibold tracking-normal text-slate-950 print:text-2xl">
              胸腔醫學衛教資料
            </h1>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 print:grid-cols-2 print:gap-3">
            {articles.map((article) => {
              const url = new URL(`/articles/${article.id}`, siteUrl).toString();
              const svg = qrSvg(url);

              return (
                <article
                  key={article.id}
                  className="break-inside-avoid rounded-2xl border border-slate-300 bg-white p-4 shadow-sm print:p-3 print:shadow-none"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <h2 className="text-lg font-semibold leading-snug text-slate-950 print:text-base">{article.title}</h2>
                    </div>
                    <div className="w-36 shrink-0 rounded-xl border border-slate-200 bg-white p-2 print:w-32 print:p-1.5">
                      {svg ? (
                        <div dangerouslySetInnerHTML={{ __html: svg }} />
                      ) : (
                        <div className="flex aspect-square items-center justify-center text-center text-xs text-slate-500">
                          網址太長，無法產生 QR
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ) : (
        <Card>
          <CardContent className="pt-5">
            <p className="text-sm text-slate-600">尚未選取衛教文章。請回到清單勾選要列印的文章。</p>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
