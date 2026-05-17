import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { PrintButton } from "@/components/print-button";
import { Card, CardContent } from "@/components/ui/card";
import { educationTopicOptions, getEducationTopicValueFromKeywords } from "@/lib/education-topics";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createQrSvg } from "@/lib/qr-code";
import { getSiteUrl } from "@/lib/site-url";
import { formatDate } from "@/lib/utils";

export const metadata = {
  title: "衛教 QR Code 列印"
};

function idsFromSearchParams(ids?: string | string[]) {
  const values = Array.isArray(ids) ? ids : ids ? [ids] : [];
  return values
    .flatMap((value) => value.split(","))
    .map((value) => value.trim())
    .filter(Boolean);
}

function topicLabel(keywords: string[]) {
  const value = getEducationTopicValueFromKeywords(keywords);
  return educationTopicOptions.find((topic) => topic.value === value)?.label ?? "衛教資料";
}

function qrSvg(url: string) {
  try {
    return createQrSvg(url, { quietZone: 3, cellSize: 2 });
  } catch {
    return "";
  }
}

export default async function EducationQrPrintPage({
  searchParams
}: {
  searchParams: Promise<{ ids?: string | string[] }>;
}) {
  await requireAdmin();
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
          title: true,
          summary: true,
          updatedAt: true,
          keywords: true
        }
      })
    : [];

  return (
    <AdminShell title="衛教 QR Code 列印">
      <div className="print:hidden mb-6 flex flex-wrap items-center gap-3">
        <Link
          href="/admin/education-qr"
          className="inline-flex h-10 items-center rounded-md border border-border bg-white px-4 text-sm font-medium text-slate-700 hover:bg-blue-50"
        >
          返回勾選清單
        </Link>
        {articles.length > 0 ? <PrintButton /> : null}
      </div>

      {articles.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 print:grid-cols-2">
          {articles.map((article) => {
            const url = new URL(`/articles/${article.id}`, siteUrl).toString();
            const svg = qrSvg(url);

            return (
              <article
                key={article.id}
                className="break-inside-avoid rounded-3xl border border-slate-300 bg-white p-5 shadow-sm print:shadow-none"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#2f6558]">{topicLabel(article.keywords)}</p>
                    <h2 className="mt-2 text-xl font-semibold leading-snug text-slate-950">{article.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{article.summary}</p>
                  </div>
                  <div className="w-32 shrink-0 rounded-2xl border border-slate-200 bg-white p-2">
                    {svg ? (
                      <div dangerouslySetInnerHTML={{ __html: svg }} />
                    ) : (
                      <div className="flex aspect-square items-center justify-center text-center text-xs text-slate-500">
                        網址太長，無法產生 QR
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-4 rounded-2xl bg-[#f7f3ea] p-3 text-xs leading-5 text-slate-700">
                  <p className="font-medium">掃描 QR code 回家閱讀</p>
                  <p className="mt-1 break-all">{url}</p>
                  <p className="mt-1 text-slate-500">更新：{formatDate(article.updatedAt)}</p>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-5">
            <p className="text-sm text-slate-600">尚未選取衛教文章。請回到清單勾選要列印的文章。</p>
          </CardContent>
        </Card>
      )}
    </AdminShell>
  );
}
