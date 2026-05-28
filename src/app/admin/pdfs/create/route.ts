import { put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

function value(formData: FormData, key: string) {
  const entry = formData.get(key);
  return typeof entry === "string" ? entry.trim() : "";
}

function checkbox(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

function nullable(value: string) {
  return value.length > 0 ? value : null;
}

function keywords(formData: FormData) {
  return value(formData, "keywords")
    .split(/[,，#\n]/)
    .map((keyword) => keyword.trim().toLowerCase())
    .filter(Boolean)
    .filter((keyword, index, list) => list.indexOf(keyword) === index);
}

async function uniquePdfSlug(title: string, requestedSlug: string) {
  const base = slugify(requestedSlug || title) || `pdf-${Date.now()}`;
  let candidate = base;
  let index = 2;

  while (await prisma.pdfDocument.findUnique({ where: { slug: candidate } })) {
    candidate = `${base}-${index}`;
    index += 1;
  }

  return candidate;
}

function cleanFileName(name: string) {
  return name.replace(/[^\w.\-\u4e00-\u9fa5]+/g, "-").replace(/-+/g, "-").slice(0, 120) || "document.pdf";
}

export async function POST(request: NextRequest) {
  await requireAdmin();
  const formData = await request.formData();
  const title = value(formData, "title");
  const file = formData.get("file");

  if (!title) {
    return NextResponse.redirect(new URL("/admin/pdfs/new?error=missing-title", request.url), 303);
  }

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.redirect(new URL("/admin/pdfs/new?error=missing-file", request.url), 303);
  }

  if (file.type !== "application/pdf") {
    return NextResponse.redirect(new URL("/admin/pdfs/new?error=not-pdf", request.url), 303);
  }

  const safeName = `${Date.now()}-${cleanFileName(file.name)}`;
  const blob = await put(`pdfs/${safeName}`, file, {
    access: "public",
    contentType: "application/pdf"
  });

  await prisma.pdfDocument.create({
    data: {
      title,
      slug: await uniquePdfSlug(title, value(formData, "slug")),
      description: nullable(value(formData, "description")),
      fileUrl: blob.url,
      fileName: file.name || safeName,
      fileSize: file.size,
      keywords: keywords(formData),
      categoryId: nullable(value(formData, "categoryId")),
      subcategoryId: nullable(value(formData, "subcategoryId")),
      isPublished: checkbox(formData, "isPublished")
    }
  });

  revalidatePath("/");
  revalidatePath("/pdfs");
  revalidatePath("/admin/pdfs");

  return NextResponse.redirect(new URL("/admin/pdfs?created=1", request.url), 303);
}
