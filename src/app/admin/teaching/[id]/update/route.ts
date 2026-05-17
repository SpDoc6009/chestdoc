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

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const [{ id }, formData] = await Promise.all([params, request.formData()]);
  const title = value(formData, "title");
  const topicId = value(formData, "topicId");
  const slug = slugify(value(formData, "slug") || title);
  const markdownContent = value(formData, "markdownContent");
  const htmlContent = value(formData, "htmlContent");
  const contentMode = htmlContent && !markdownContent ? "HTML" : "MARKDOWN";

  if (!id || !title || !topicId || !slug) {
    return NextResponse.redirect(new URL("/admin/teaching?error=missing-fields", request.url), 303);
  }

  await prisma.teachingLesson.update({
    where: { id },
    data: {
      title,
      slug,
      summary: value(formData, "summary"),
      topicId,
      contentMode,
      markdownContent: nullable(markdownContent),
      htmlContent: nullable(htmlContent),
      keywords: keywords(formData),
      isPublished: checkbox(formData, "isPublished"),
      isFeatured: checkbox(formData, "isFeatured")
    }
  });

  return NextResponse.redirect(new URL("/admin/teaching?updated=1", request.url), 303);
}
