import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { ArrowLeft, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  educationTopicKeywords,
  educationTopicOptions,
  getEducationTopicKeyword,
  getEducationTopicValueFromKeywords
} from "@/lib/education-topics";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export const metadata = {
  title: "衛教 QR Code 列印"
};

function educationWhere() {
  return {
    OR: [
      { keywords: { has: "衛教" } },
      { keywords: { has: "patient-education" } },
      { keywords: { hasSome: [...educationTopicKeywords] } }
    ]
  } satisfies Prisma.ArticleWhereInput;
}

function topicLabel(keywords: string[]) {
  const value = getEducationTopicValueFromKeywords(keywords);
  return educationTopicOptions.find((topic) => topic.value === value)?.label ?? "衛教資料";
}

export default async function PublicEducationQrPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; topic?: string }>;
}) {
  const { q = "", topic = "all" } = await searchParams;
  const query = q.trim();
  const topicKeyword = topic === "all" ? undefined : getEducationTopicKeyword(topic);

  const filters: Prisma.ArticleWhereInput[] = [educationWhere(), { isPublished: true }];
  if (topicKeyword) filters.push({ keywords: { has: topicKeyword } });
  if (query) {
    filters.push({
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { summary: { contains: query, mode: "insensitive" } },
        { content: { contains: query, mode: "insensitive" } },
        { htmlContent: { contains: query, mode: "insensitive" } }
      ]
    });
  }

  const articles = await prisma.article.findMany({
    where: { AND: filters },
    orderBy: [{ updatedAt: "desc" }, { title: "asc" }],
    select: {
      id: true,
      slug: true,
      title: true,
      summary: true,
      updatedAt: true,
      keywords: true
    }
  });

  return (
    <main className="section-shell py-10">
      <Link href="/education" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        回衛教園區
      </Link>

      <section className="mb-8 rounded-[2rem] border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-[#f7f3ea] p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-emerald-800 shadow-sm">
              <QrCode className="h-8 w-8" aria-hidden="true" />
            </div>
            <p className="text-sm font-semibold text-emerald-800">Patient Education QR Code</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950">衛教 QR code 列印</h1>
            <p className="mt-3 max-w-2xl leading-7 text-slate-600">
              勾選你需要的衛教文章，就可一起列印QR code使用。
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="space-y-5">
          <Card className="rounded-3xl">
            <CardHeader>
              <CardTitle>篩選衛教文章</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="grid gap-4 md:grid-cols-[minmax(0,1fr)_14rem_auto]">
                <div className="space-y-2">
                  <Label htmlFor="q">搜尋標題或內容</Label>
                  <Input id="q" name="q" defaultValue={query} placeholder="例如：COPD、吸入器、檢查" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="topic">衛教主題</Label>
                  <Select id="topic" name="topic" defaultValue={topic}>
                    <option value="all">全部主題</option>
                    {educationTopicOptions.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="flex items-end gap-2">
                  <Button type="submit">篩選</Button>
                  <Link
                    href="/education/qr"
                    className="inline-flex h-10 items-center rounded-md border border-border bg-white px-4 text-sm font-medium text-slate-700 hover:bg-blue-50"
                  >
                    清除
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>

          <form action="/education/qr/print" className="space-y-4">
            <div className="flex flex-col gap-3 rounded-3xl border border-border bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-primary">可列印衛教 QR Code</p>
                <p className="mt-1 text-sm text-slate-600">勾選你需要的衛教文章，就可一起列印QR code使用。</p>
              </div>
              <Button type="submit">產生列印版</Button>
            </div>

            {articles.length > 0 ? (
              <div className="grid gap-3">
                {articles.map((article) => (
                  <label
                    key={article.id}
                    className="flex cursor-pointer gap-4 rounded-3xl border border-border bg-white p-4 shadow-sm transition hover:border-primary/30 hover:bg-[#fbfaf4]"
                  >
                    <input
                      type="checkbox"
                      name="ids"
                      value={article.id}
                      className="mt-1 h-5 w-5 rounded border-slate-300 text-primary"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="text-base font-semibold text-slate-950">{article.title}</span>
                        <span className="rounded-full bg-[#e8f1ec] px-2.5 py-1 text-xs font-medium text-[#2f6558]">
                          {topicLabel(article.keywords)}
                        </span>
                      </span>
                      <span className="mt-2 block text-sm leading-6 text-slate-600">{article.summary}</span>
                      <span className="mt-2 block text-xs text-slate-500">更新：{formatDate(article.updatedAt)}</span>
                    </span>
                    <Link
                      href={`/a/${article.id}`}
                      className="hidden shrink-0 text-sm font-medium text-primary hover:underline sm:inline"
                    >
                      預覽
                    </Link>
                  </label>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-5">
                  <p className="text-sm text-slate-600">目前沒有符合條件的衛教文章。</p>
                </CardContent>
              </Card>
            )}
          </form>
        </div>

        <Card className="h-fit rounded-3xl">
          <CardHeader>
            <CardTitle>怎麼使用</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-6 text-slate-600">
            <p>1. 找到你需要的衛教主題。</p>
            <p>2. 勾選想要列印的文章。</p>
            <p>3. 產生列印版後，可直接列印或另存 PDF。</p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
