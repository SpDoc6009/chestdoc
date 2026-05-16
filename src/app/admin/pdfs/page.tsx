import Link from "next/link";
import { deletePdfAction } from "@/lib/actions";
import { AdminShell } from "@/components/admin-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate, formatFileSize } from "@/lib/utils";

export const metadata = {
  title: "管理 PDF"
};

export default async function AdminPdfsPage() {
  await requireAdmin();
  const pdfs = await prisma.pdfDocument.findMany({
    orderBy: { updatedAt: "desc" },
    include: { category: true, subcategory: true }
  });

  return (
    <AdminShell title="PDF 文件庫">
      <div className="mb-4">
        <Link className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90" href="/admin/pdfs/new">
          上傳 PDF
        </Link>
      </div>
      <Card>
        <CardHeader><CardTitle>PDF 列表</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>標題</TableHead><TableHead>檔名</TableHead><TableHead>大小</TableHead><TableHead>狀態</TableHead><TableHead>更新</TableHead><TableHead>操作</TableHead></TableRow></TableHeader>
            <TableBody>
              {pdfs.map((pdf) => (
                <TableRow key={pdf.id}>
                  <TableCell className="font-medium">{pdf.title}</TableCell>
                  <TableCell>{pdf.fileName}</TableCell>
                  <TableCell>{formatFileSize(pdf.fileSize)}</TableCell>
                  <TableCell>{pdf.isPublished ? "已發布" : "草稿"}</TableCell>
                  <TableCell>{formatDate(pdf.updatedAt)}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap items-center gap-3">
                      <Link className="text-sm font-medium text-primary hover:underline" href={`/admin/pdfs/${pdf.id}/edit`}>
                        編輯
                      </Link>
                      <Link className="text-sm font-medium text-primary hover:underline" href={`/pdfs/${pdf.slug}`}>
                        查看
                      </Link>
                      <form action={deletePdfAction}>
                        <input type="hidden" name="id" value={pdf.id} />
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
