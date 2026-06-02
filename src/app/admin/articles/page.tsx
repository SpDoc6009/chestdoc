import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { deleteArticleAction } from "@/lib/actions";
import { AdminShell } from "@/components/admin-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requireAdmin } from "@/lib/auth";
import { getCategoryOptions } from "@/lib/data";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export const metadata = {
  title: "管理圖文解說"
};

export default async function AdminArticlesPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; status?: string; category?: string; keyword?: string }>;
}) {
  await requireAdmin();
  const [{ q = "", status = "all", category = "all", keyword = "" }, categories] = await Promise.all([
    searchParams,
    getCategoryOptions()
  ]);
  const query = q.trim();
  const keywordQuery = keyword.trim().toLowerCase();
  const where: Prisma.ArticleWhereInput = {
    ...(status === "published" ? { isPublished: true } : {}),
    ...(status === "draft" ? { isPublished: false } : {}),
    ...(category.startsWith("category:") ? { categoryId: category.replace("category:", "") } : {}),
    ...(category.startsWith("subcategory:") ? { subcategoryId: category.replace("subcategory:", "") } : {}),
    ...(keywordQuery ? { keywords: { has: keywordQuery } } : {}),
    ...(query
      ? {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { summary: { contains: query, mode: "insensitive" } },
            { content: { contains: query, mode: "insensitive" } },
            { htmlContent: { contains: query, mode: "insensitive" } }
          ]
        }
      : {})
  };
  const articles = await prisma.article.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      slug: true,
      title: true,
      isPublished: true,
      updatedAt: true,
      category: { select: { name: true } },
      subcategory: { select: { name: true } }
    }
  });

  return (
    <AdminShell title="圖文解說">
      <div className="mb-4">
        <Link className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90" href="/admin/articles/new">
          新增圖文解說
        </Link>
      </div>
      <Card className="mb-5">
        <CardHeader><CardTitle>搜尋與篩選</CardTitle></CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="q">標題 / 摘要 / 內文</Label>
              <Input id="q" name="q" defaultValue={query} placeholder="例如：COPD" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="keyword">關鍵字</Label>
              <Input id="keyword" name="keyword" defaultValue={keywordQuery} placeholder="例如：guideline" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">狀態</Label>
              <Select id="status" name="status" defaultValue={status}>
                <option value="all">全部</option>
                <option value="published">已發布</option>
                <option value="draft">草稿</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">分類</Label>
              <Select id="category" name="category" defaultValue={category}>
                <option value="all">全部分類</option>
                {categories.map((item) => (
                  <optgroup key={item.id} label={item.name}>
                    <option value={`category:${item.id}`}>{item.name}</option>
                    {item.subcategories.map((subcategory) => (
                      <option key={subcategory.id} value={`subcategory:${subcategory.id}`}>
                        {subcategory.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </Select>
            </div>
            <div className="flex gap-3 md:col-span-4">
              <Button type="submit">套用篩選</Button>
              <Link href="/admin/articles" className="inline-flex h-10 items-center rounded-md border border-border bg-white px-4 text-sm font-medium text-slate-700 hover:bg-blue-50">
                清除
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>文章列表（{articles.length}）</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>標題</TableHead>
                <TableHead>分類</TableHead>
                <TableHead>狀態</TableHead>
                <TableHead>更新</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {articles.map((article) => (
                <TableRow key={article.id}>
                  <TableCell className="font-medium">{article.title}</TableCell>
                  <TableCell>{article.subcategory?.name ?? article.category?.name ?? "未分類"}</TableCell>
                  <TableCell>{article.isPublished ? "已發布" : "草稿"}</TableCell>
                  <TableCell>{formatDate(article.updatedAt)}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap items-center gap-3">
                      <Link className="text-sm font-medium text-primary hover:underline" href={`/admin/articles/${article.id}/edit`}>
                        編輯
                      </Link>
                      <Link className="text-sm font-medium text-primary hover:underline" href={`/a/${article.id}?preview=1`}>
                        查看
                      </Link>
                      <form action={deleteArticleAction}>
                        <input type="hidden" name="id" value={article.id} />
                        <Button type="submit" variant="ghost" className="h-auto p-0 text-sm font-medium text-red-600 hover:bg-transparent hover:text-red-700">
                          刪除
                        </Button>
                      </form>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AdminShell>
  );
}
