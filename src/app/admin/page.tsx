import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "後台管理"
};

export default async function AdminPage() {
  await requireAdmin();
  const [categories, articles, reports, pdfs, links] = await Promise.all([
    prisma.category.count(),
    prisma.article.count(),
    prisma.htmlReport.count(),
    prisma.pdfDocument.count(),
    prisma.usefulLink.count()
  ]);

  const stats = [
    { label: "分類", value: categories, href: "/admin/categories" },
    { label: "圖文解說", value: articles, href: "/admin/articles" },
    { label: "醫學新知", value: reports, href: "/admin/reports" },
    { label: "PDF", value: pdfs, href: "/admin/pdfs" },
    { label: "連結", value: links, href: "/admin/links" }
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
                {stat.value}
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </AdminShell>
  );
}
