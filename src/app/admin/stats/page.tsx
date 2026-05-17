import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export const metadata = {
  title: "網站統計"
};

type ContentType = "article" | "report" | "teaching" | "pdf";

const typeMeta: Record<ContentType, { label: string; color: string; tint: string }> = {
  article: { label: "圖文解說", color: "#0ea5e9", tint: "border-sky-100 bg-sky-50 text-sky-800" },
  report: { label: "醫學新知", color: "#4f46e5", tint: "border-indigo-100 bg-indigo-50 text-indigo-800" },
  teaching: { label: "教學筆記", color: "#f59e0b", tint: "border-amber-100 bg-amber-50 text-amber-800" },
  pdf: { label: "PDF 文件", color: "#64748b", tint: "border-slate-200 bg-slate-50 text-slate-700" }
};

function isContentType(value: string): value is ContentType {
  return value === "article" || value === "report" || value === "teaching" || value === "pdf";
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("zh-TW").format(value);
}

function PieChart({ totals, totalViews }: { totals: Record<ContentType, number>; totalViews: number }) {
  const segments = (Object.keys(typeMeta) as ContentType[])
    .map((type) => ({ type, value: totals[type] }))
    .filter((segment) => segment.value > 0);

  let cursor = 0;
  const gradient =
    segments.length > 0
      ? segments
          .map((segment) => {
            const start = cursor;
            const end = cursor + (segment.value / totalViews) * 100;
            cursor = end;
            return `${typeMeta[segment.type].color} ${start}% ${end}%`;
          })
          .join(", ")
      : "#e2e8f0 0% 100%";

  return (
    <div className="flex flex-col items-center gap-5 lg:flex-row lg:items-center">
      <div
        className="relative grid h-56 w-56 shrink-0 place-items-center rounded-full border border-slate-200 shadow-sm"
        style={{ background: `conic-gradient(${gradient})` }}
      >
        <div className="grid h-28 w-28 place-items-center rounded-full border border-slate-200 bg-white text-center shadow-inner">
          <div>
            <div className="text-2xl font-semibold text-slate-950">{formatNumber(totalViews)}</div>
            <div className="text-xs font-medium text-slate-500">總點閱</div>
          </div>
        </div>
      </div>
      <div className="grid w-full gap-3 sm:grid-cols-2">
        {(Object.keys(typeMeta) as ContentType[]).map((type) => {
          const value = totals[type];
          const percent = totalViews > 0 ? Math.round((value / totalViews) * 100) : 0;
          return (
            <div key={type} className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: typeMeta[type].color }} />
                  <span className="font-medium text-slate-800">{typeMeta[type].label}</span>
                </div>
                <span className="text-sm text-slate-500">{percent}%</span>
              </div>
              <div className="mt-2 text-2xl font-semibold text-slate-950">{formatNumber(value)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default async function AdminStatsPage() {
  await requireAdmin();

  const views = await prisma.contentView.findMany({
    orderBy: [{ viewCount: "desc" }, { updatedAt: "desc" }]
  });

  const totals = views.reduce<Record<ContentType, number>>(
    (acc, item) => {
      if (isContentType(item.contentType)) {
        acc[item.contentType] += item.viewCount;
      }
      return acc;
    },
    { article: 0, report: 0, teaching: 0, pdf: 0 }
  );
  const totalViews = Object.values(totals).reduce((sum, value) => sum + value, 0);
  const topView = views[0];
  const trackedCount = views.length;

  return (
    <AdminShell title="網站統計">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">總點閱人次</CardTitle>
            <CardDescription>目前已記錄的內容瀏覽次數</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-primary">{formatNumber(totalViews)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">已追蹤內容</CardTitle>
            <CardDescription>有被讀者開啟過的文章或文件</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-primary">{formatNumber(trackedCount)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">目前最高點閱</CardTitle>
            <CardDescription>排序會隨點閱自動更新</CardDescription>
          </CardHeader>
          <CardContent>
            {topView ? (
              <Link href={topView.path} className="line-clamp-2 text-lg font-semibold text-primary hover:underline">
                {topView.title}
              </Link>
            ) : (
              <p className="text-sm text-slate-500">尚未累積點閱資料</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(460px,1.4fr)]">
        <Card>
          <CardHeader>
            <CardTitle>各類內容點閱比例</CardTitle>
            <CardDescription>依圖文解說、醫學新知、教學筆記、PDF 文件統計</CardDescription>
          </CardHeader>
          <CardContent>
            <PieChart totals={totals} totalViews={totalViews} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>熱門內容排行</CardTitle>
            <CardDescription>讀者實際開啟內容頁後才會累積點閱</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>內容</TableHead>
                  <TableHead>類型</TableHead>
                  <TableHead className="text-right">點閱</TableHead>
                  <TableHead>最近點閱</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {views.length > 0 ? (
                  views.map((item) => {
                    const type = isContentType(item.contentType) ? item.contentType : "article";
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="max-w-[320px]">
                          <Link href={item.path} className="line-clamp-2 font-medium text-primary hover:underline">
                            {item.title}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Badge className={typeMeta[type].tint}>{typeMeta[type].label}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold">{formatNumber(item.viewCount)}</TableCell>
                        <TableCell className="whitespace-nowrap text-slate-500">{formatDate(item.updatedAt)}</TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="py-8 text-center text-slate-500">
                      尚未有點閱資料。先開啟幾篇前台內容後，這裡就會開始出現統計。
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
