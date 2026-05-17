import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "後台管理"
};

async function safeCount(label: string, task: () => Promise<number>) {
  try {
    return { label, value: await task(), ok: true };
  } catch (error) {
    console.error(`Failed to load admin count: ${label}`, error);
    return { label, value: 0, ok: false };
  }
}

export default async function AdminPage() {
  await requireAdmin();
  const [categories, articles, reports, pdfs, links] = await Promise.all([
    safeCount("分類", () => prisma.category.count()),
    safeCount("圖文解說", () => prisma.article.count()),
    safeCount("醫學新知", () => prisma.htmlReport.count()),
    safeCount("PDF", () => prisma.pdfDocument.count()),
    safeCount("連結", () => prisma.usefulLink.count())
  ]);

  const stats = [
    { ...categories, href: "/admin/categories" },
    { ...articles, href: "/admin/articles" },
    { ...reports, href: "/admin/reports" },
    { ...pdfs, href: "/admin/pdfs" },
    { ...links, href: "/admin/links" }
  ];

  return (
    <AdminShell title="內容總覽">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader>
              <CardTitle className="text-base">{stat.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <Link href={stat.href} className="text-3xl font-semibold text-primary hover:underline">
                {stat.ok ? stat.value : "!"}
              </Link>
              {!stat.ok ? <p className="mt-2 text-xs leading-5 text-red-600">暫時無法讀取，請稍後重整。</p> : null}
            </CardContent>
          </Card>
        ))}
      </div>
    </AdminShell>
  );
}
