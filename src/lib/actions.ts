"use server";

import { del, put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { clearAdminSessionCookie, requireAdmin, setAdminSessionCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

type SlugModel = "category" | "article" | "report" | "pdf" | "teachingTopic" | "teachingLesson";

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

async function slugExists(model: SlugModel, slug: string) {
  if (model === "category") {
    return Boolean(await prisma.category.findUnique({ where: { slug } }));
  }
  if (model === "article") {
    return Boolean(await prisma.article.findUnique({ where: { slug } }));
  }
  if (model === "report") {
    return Boolean(await prisma.htmlReport.findUnique({ where: { slug } }));
  }
  if (model === "teachingTopic") {
    return Boolean(await prisma.teachingTopic.findUnique({ where: { slug } }));
  }
  if (model === "teachingLesson") {
    return Boolean(await prisma.teachingLesson.findUnique({ where: { slug } }));
  }
  return Boolean(await prisma.pdfDocument.findUnique({ where: { slug } }));
}

async function uniqueSlug(model: SlugModel, title: string, requestedSlug?: string) {
  const base = slugify(requestedSlug || title) || `item-${Date.now()}`;
  let candidate = base;
  let index = 2;
  while (await slugExists(model, candidate)) {
    candidate = `${base}-${index}`;
    index += 1;
  }
  return candidate;
}

export async function loginAction(formData: FormData) {
  const password = value(formData, "password");
  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
    redirect("/admin/login?error=1");
  }

  await setAdminSessionCookie();
  redirect("/admin");
}

export async function logoutAction() {
  await clearAdminSessionCookie();
  redirect("/admin/login");
}

export async function createCategoryAction(formData: FormData) {
  await requireAdmin();
  const name = value(formData, "name");
  if (!name) throw new Error("Category name is required.");

  await prisma.category.create({
    data: {
      name,
      slug: await uniqueSlug("category", name, value(formData, "slug")),
      description: nullable(value(formData, "description")),
      sortOrder: Number(value(formData, "sortOrder") || 0)
    }
  });

  revalidatePath("/admin/categories");
  revalidatePath("/categories");
  redirect("/admin/categories");
}

export async function createSubcategoryAction(formData: FormData) {
  await requireAdmin();
  const name = value(formData, "name");
  const categoryId = value(formData, "categoryId");
  if (!name || !categoryId) throw new Error("Subcategory name and category are required.");

  await prisma.subcategory.create({
    data: {
      name,
      slug: slugify(value(formData, "slug") || name),
      description: nullable(value(formData, "description")),
      sortOrder: Number(value(formData, "sortOrder") || 0),
      categoryId
    }
  });

  revalidatePath("/admin/categories");
  revalidatePath("/categories");
  redirect("/admin/categories");
}

export async function updateCategoryAction(formData: FormData) {
  await requireAdmin();
  const id = value(formData, "id");
  const name = value(formData, "name");
  const slug = slugify(value(formData, "slug") || name);
  if (!id || !name || !slug) throw new Error("Category id, name and slug are required.");

  await prisma.category.update({
    where: { id },
    data: {
      name,
      slug,
      description: nullable(value(formData, "description")),
      sortOrder: Number(value(formData, "sortOrder") || 0)
    }
  });

  revalidatePath("/admin/categories");
  revalidatePath("/categories");
  redirect("/admin/categories");
}

export async function updateSubcategoryAction(formData: FormData) {
  await requireAdmin();
  const id = value(formData, "id");
  const name = value(formData, "name");
  const categoryId = value(formData, "categoryId");
  const slug = slugify(value(formData, "slug") || name);
  if (!id || !name || !categoryId || !slug) {
    throw new Error("Subcategory id, name, category and slug are required.");
  }

  await prisma.subcategory.update({
    where: { id },
    data: {
      name,
      slug,
      description: nullable(value(formData, "description")),
      sortOrder: Number(value(formData, "sortOrder") || 0),
      categoryId
    }
  });

  revalidatePath("/admin/categories");
  revalidatePath("/categories");
  redirect("/admin/categories");
}

export async function createArticleAction(formData: FormData) {
  await requireAdmin();
  const title = value(formData, "title");
  if (!title) throw new Error("Article title is required.");

  const article = await prisma.article.create({
    data: {
      title,
      slug: await uniqueSlug("article", title, value(formData, "slug")),
      summary: value(formData, "summary"),
      content: value(formData, "content"),
      keywords: keywords(formData),
      categoryId: nullable(value(formData, "categoryId")),
      subcategoryId: nullable(value(formData, "subcategoryId")),
      isPublished: checkbox(formData, "isPublished"),
      isFeatured: checkbox(formData, "isFeatured")
    }
  });

  revalidatePath("/");
  revalidatePath("/articles");
  revalidatePath("/admin/articles");
  redirect(`/admin/articles/${article.id}/edit`);
}

export async function updateArticleAction(formData: FormData) {
  await requireAdmin();
  const id = value(formData, "id");
  const title = value(formData, "title");
  const slug = slugify(value(formData, "slug") || title);
  if (!id || !title || !slug) throw new Error("Article id, title and slug are required.");

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

  revalidatePath("/");
  revalidatePath("/articles");
  revalidatePath(`/articles/${id}`);
  revalidatePath(`/articles/${slug}`);
  revalidatePath("/admin/articles");
  revalidatePath(`/admin/articles/${id}/edit`);
  redirect(`/admin/articles/${id}/edit`);
}

export async function deleteArticleAction(formData: FormData) {
  await requireAdmin();
  const id = value(formData, "id");
  if (!id) throw new Error("Article id is required.");

  await prisma.article.delete({ where: { id } });

  revalidatePath("/");
  revalidatePath("/articles");
  revalidatePath("/admin/articles");
  redirect("/admin/articles");
}

export async function createReportAction(formData: FormData) {
  await requireAdmin();
  const title = value(formData, "title");
  if (!title) throw new Error("Report title is required.");

  await prisma.htmlReport.create({
    data: {
      title,
      slug: await uniqueSlug("report", title, value(formData, "slug")),
      summary: value(formData, "summary"),
      htmlContent: value(formData, "htmlContent"),
      keywords: keywords(formData),
      categoryId: nullable(value(formData, "categoryId")),
      subcategoryId: nullable(value(formData, "subcategoryId")),
      isPublished: checkbox(formData, "isPublished")
    }
  });

  revalidatePath("/");
  revalidatePath("/reports");
  revalidatePath("/admin/reports");
  redirect("/admin/reports");
}

export async function updateReportAction(formData: FormData) {
  await requireAdmin();
  const id = value(formData, "id");
  const title = value(formData, "title");
  const slug = slugify(value(formData, "slug") || title);
  if (!id || !title || !slug) throw new Error("Report id, title and slug are required.");

  await prisma.htmlReport.update({
    where: { id },
    data: {
      title,
      slug,
      summary: value(formData, "summary"),
      htmlContent: value(formData, "htmlContent"),
      keywords: keywords(formData),
      categoryId: nullable(value(formData, "categoryId")),
      subcategoryId: nullable(value(formData, "subcategoryId")),
      isPublished: checkbox(formData, "isPublished")
    }
  });

  revalidatePath("/");
  revalidatePath("/reports");
  revalidatePath(`/reports/${slug}`);
  revalidatePath("/admin/reports");
  redirect("/admin/reports");
}

export async function deleteReportAction(formData: FormData) {
  await requireAdmin();
  const id = value(formData, "id");
  if (!id) throw new Error("Report id is required.");

  await prisma.htmlReport.delete({ where: { id } });

  revalidatePath("/");
  revalidatePath("/reports");
  revalidatePath("/admin/reports");
  redirect("/admin/reports");
}

export async function createPdfAction(formData: FormData) {
  await requireAdmin();
  const title = value(formData, "title");
  const file = formData.get("file");

  if (!title) throw new Error("PDF title is required.");
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Please upload a PDF file.");
  }
  if (file.type !== "application/pdf") {
    throw new Error("Only application/pdf files are allowed.");
  }

  const blob = await put(`pdfs/${Date.now()}-${file.name}`, file, {
    access: "public"
  });

  await prisma.pdfDocument.create({
    data: {
      title,
      slug: await uniqueSlug("pdf", title, value(formData, "slug")),
      description: nullable(value(formData, "description")),
      fileUrl: blob.url,
      fileName: file.name,
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
  redirect("/admin/pdfs");
}

export async function updatePdfAction(formData: FormData) {
  await requireAdmin();
  const id = value(formData, "id");
  const title = value(formData, "title");
  const slug = slugify(value(formData, "slug") || title);
  if (!id || !title || !slug) throw new Error("PDF id, title and slug are required.");

  await prisma.pdfDocument.update({
    where: { id },
    data: {
      title,
      slug,
      description: nullable(value(formData, "description")),
      keywords: keywords(formData),
      categoryId: nullable(value(formData, "categoryId")),
      subcategoryId: nullable(value(formData, "subcategoryId")),
      isPublished: checkbox(formData, "isPublished")
    }
  });

  revalidatePath("/");
  revalidatePath("/pdfs");
  revalidatePath(`/pdfs/${slug}`);
  revalidatePath("/admin/pdfs");
  redirect("/admin/pdfs");
}

export async function deletePdfAction(formData: FormData) {
  await requireAdmin();
  const id = value(formData, "id");
  if (!id) throw new Error("PDF id is required.");

  const pdf = await prisma.pdfDocument.findUnique({ where: { id } });
  if (!pdf) throw new Error("PDF not found.");

  try {
    await del(pdf.fileUrl);
  } catch {
    // Keep deletion usable in local development even when Blob credentials are unavailable.
  }

  await prisma.pdfDocument.delete({ where: { id } });

  revalidatePath("/");
  revalidatePath("/pdfs");
  revalidatePath("/admin/pdfs");
  redirect("/admin/pdfs");
}

export async function createLinkAction(formData: FormData) {
  await requireAdmin();
  const title = value(formData, "title");
  const url = value(formData, "url");
  if (!title || !url) throw new Error("Link title and URL are required.");

  await prisma.usefulLink.create({
    data: {
      title,
      url,
      description: nullable(value(formData, "description")),
      group: value(formData, "group") || "一般",
      isFavorite: checkbox(formData, "isFavorite"),
      sortOrder: Number(value(formData, "sortOrder") || 0)
    }
  });

  revalidatePath("/");
  revalidatePath("/links");
  revalidatePath("/admin/links");
  redirect("/admin/links");
}

export async function createTeachingTopicAction(formData: FormData) {
  await requireAdmin();
  const title = value(formData, "title");
  if (!title) throw new Error("Teaching topic title is required.");

  await prisma.teachingTopic.create({
    data: {
      title,
      slug: await uniqueSlug("teachingTopic", title, value(formData, "slug")),
      description: nullable(value(formData, "description")),
      sortOrder: Number(value(formData, "sortOrder") || 0)
    }
  });

  revalidatePath("/teaching");
  revalidatePath("/admin/teaching");
  redirect("/admin/teaching");
}

export async function createTeachingLessonAction(formData: FormData) {
  await requireAdmin();
  const title = value(formData, "title");
  const topicId = value(formData, "topicId");
  const markdownContent = value(formData, "markdownContent");
  const htmlContent = value(formData, "htmlContent");
  const contentMode = htmlContent && !markdownContent ? "HTML" : "MARKDOWN";
  if (!title || !topicId) throw new Error("Teaching lesson title and topic are required.");

  await prisma.teachingLesson.create({
    data: {
      title,
      slug: await uniqueSlug("teachingLesson", title, value(formData, "slug")),
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

  revalidatePath("/");
  revalidatePath("/teaching");
  revalidatePath("/admin/teaching");
  redirect("/admin/teaching");
}

export async function updateTeachingLessonAction(formData: FormData) {
  await requireAdmin();
  const id = value(formData, "id");
  const title = value(formData, "title");
  const topicId = value(formData, "topicId");
  const slug = slugify(value(formData, "slug") || title);
  const markdownContent = value(formData, "markdownContent");
  const htmlContent = value(formData, "htmlContent");
  const contentMode = htmlContent && !markdownContent ? "HTML" : "MARKDOWN";
  if (!id || !title || !topicId || !slug) {
    throw new Error("Teaching lesson id, title, slug and topic are required.");
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

  revalidatePath("/");
  revalidatePath("/teaching");
  revalidatePath(`/teaching/lessons/${slug}`);
  revalidatePath("/admin/teaching");
  redirect("/admin/teaching");
}

export async function deleteTeachingLessonAction(formData: FormData) {
  await requireAdmin();
  const id = value(formData, "id");
  if (!id) throw new Error("Teaching lesson id is required.");

  await prisma.teachingLesson.delete({ where: { id } });

  revalidatePath("/");
  revalidatePath("/teaching");
  revalidatePath("/admin/teaching");
  redirect("/admin/teaching");
}
