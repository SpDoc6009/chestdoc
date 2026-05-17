import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { educationTopicKeywords, getEducationTopicKeyword } from "@/lib/education-topics";
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
  const hasEducationTopicField = formData.has("educationTopic");
  const selectedEducationTopic = getEducationTopicKeyword(value(formData, "educationTopic"));
  const rawKeywords = value(formData, "keywords")
    .split(/[,，#\n]/)
    .map((keyword) => keyword.trim().toLowerCase())
    .filter(Boolean)
    .filter((keyword) => !hasEducationTopicField || !educationTopicKeywords.includes(keyword));

  if (selectedEducationTopic) {
    rawKeywords.push("衛教", "patient-education", "病人與家屬", selectedEducationTopic);
  }

  return rawKeywords.filter((keyword, index, list) => list.indexOf(keyword) === index);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const [{ id }, formData] = await Promise.all([params, request.formData()]);
  const title = value(formData, "title");
  const slug = slugify(value(formData, "slug") || title);

  if (!id || !title || !slug) {
    return NextResponse.redirect(new URL("/admin/articles?error=missing-fields", request.url), 303);
  }

  await prisma.article.update({
    where: { id },
    data: {
      title,
      slug,
      summary: value(formData, "summary"),
      content: value(formData, "content"),
      keywords: keywords(formData),
      categoryId: nullable(value(formData, "categoryId")),
      subcategoryId: nullable(value(formData, "subcategoryId")),
      isPublished: checkbox(formData, "isPublished"),
      isFeatured: checkbox(formData, "isFeatured")
    }
  });

  return NextResponse.redirect(new URL("/admin/articles?updated=1", request.url), 303);
}
