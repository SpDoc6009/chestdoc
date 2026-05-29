import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

type CreatePdfPayload = {
  title?: string;
  slug?: string;
  keywords?: string;
  categoryId?: string;
  subcategoryId?: string;
  description?: string;
  isPublished?: boolean;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
};

function nullable(value?: string) {
  const trimmed = value?.trim() ?? "";
  return trimmed.length > 0 ? trimmed : null;
}

function keywords(value?: string) {
  return (value ?? "")
    .split(/[,，#\n]/)
    .map((keyword) => keyword.trim().toLowerCase())
    .filter(Boolean)
    .filter((keyword, index, list) => list.indexOf(keyword) === index);
}

async function uniquePdfSlug(title: string, requestedSlug?: string) {
  const base = slugify(requestedSlug || title) || `pdf-${Date.now()}`;
  let candidate = base;
  let index = 2;

  while (await prisma.pdfDocument.findUnique({ where: { slug: candidate } })) {
    candidate = `${base}-${index}`;
    index += 1;
  }

  return candidate;
}

export async function POST(request: NextRequest) {
  await requireAdmin();
  const payload = (await request.json()) as CreatePdfPayload;
  const title = payload.title?.trim() ?? "";
  const fileUrl = payload.fileUrl?.trim() ?? "";
  const fileName = payload.fileName?.trim() || "document.pdf";
  const fileSize = Number(payload.fileSize ?? 0);

  if (!title || !fileUrl || !fileSize) {
    return NextResponse.json({ error: "缺少 PDF 標題或檔案資訊。" }, { status: 400 });
  }

  await prisma.pdfDocument.create({
    data: {
      title,
      slug: await uniquePdfSlug(title, payload.slug),
      description: nullable(payload.description),
      fileUrl,
      fileName,
      fileSize,
      keywords: keywords(payload.keywords),
      categoryId: nullable(payload.categoryId),
      subcategoryId: nullable(payload.subcategoryId),
      isPublished: Boolean(payload.isPublished)
    }
  });

  revalidatePath("/");
  revalidatePath("/pdfs");
  revalidatePath("/admin/pdfs");

  return NextResponse.json({ ok: true, redirectTo: "/admin/pdfs?created=1" });
}
