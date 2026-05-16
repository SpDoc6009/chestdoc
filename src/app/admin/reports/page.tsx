import Link from "next/link";
import { deleteReportAction } from "@/lib/actions";
import { AdminShell } from "@/components/admin-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export const metadata = {
  title: "管理醫學新知"
};

export default async function AdminReportsPage() {
  await requireAdmin();
  const reports = await prisma.htmlReport.findMany({
    orderBy: { updatedAt: "desc" },
    include: { category: true, subcategory: true }
  });

  return (
    <AdminShell title="醫學新知">
      <div className="mb-4">
        <Link className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90" href="/admin/reports/new">
          新增醫學新知
        </Link>
      </div>
      <Card>
        <CardHeader><CardTitle>醫學新知列表</CardTitle></CardHeader>
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
              {reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="font-medium">{report.title}</TableCell>
                  <TableCell>{report.subcategory?.name ?? report.category?.name ?? "未分類"}</TableCell>
                  <TableCell>{report.isPublished ? "已發布" : "草稿"}</TableCell>
                  <TableCell>{formatDate(report.updatedAt)}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap items-center gap-3">
                      <Link className="text-sm font-medium text-primary hover:underline" href={`/admin/reports/${report.id}/edit`}>
                        編輯
                      </Link>
                      <Link className="text-sm font-medium text-primary hover:underline" href={`/reports/${report.id}`}>
                        查看
                      </Link>
                      <form action={deleteReportAction}>
                        <input type="hidden" name="id" value={report.id} />
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
