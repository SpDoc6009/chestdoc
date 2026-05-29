import { AdminShell } from "@/components/admin-shell";
import { PdfUploadForm } from "@/components/pdf-upload-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth";
import { getCategoryOptions } from "@/lib/data";

export const metadata = {
  title: "上傳 PDF"
};

export default async function NewPdfPage() {
  await requireAdmin();
  const categories = await getCategoryOptions();

  return (
    <AdminShell title="上傳 PDF 文件">
      <Card>
        <CardHeader><CardTitle>PDF 資訊</CardTitle></CardHeader>
        <CardContent>
          <PdfUploadForm categories={categories} />
        </CardContent>
      </Card>
    </AdminShell>
  );
}
