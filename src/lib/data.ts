import { prisma } from "@/lib/prisma";

export function getCategoryOptions() {
  return prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: {
      subcategories: {
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }]
      }
    }
  });
}

export function getPublishedArticleBySlug(slug: string) {
  const encodedSlug = encodeURIComponent(slug);
  const decodedSlug = decodeURIComponent(slug);
  return prisma.article.findFirst({
    where: {
      isPublished: true,
      OR: [{ slug }, { slug: encodedSlug }, { slug: decodedSlug }, { id: slug }]
    },
    include: { category: true, subcategory: true }
  });
}

export function getArticleBySlug(slug: string) {
  const encodedSlug = encodeURIComponent(slug);
  const decodedSlug = decodeURIComponent(slug);
  return prisma.article.findFirst({
    where: {
      OR: [{ slug }, { slug: encodedSlug }, { slug: decodedSlug }, { id: slug }]
    },
    include: { category: true, subcategory: true }
  });
}

export function getPublishedReportBySlug(slug: string) {
  const encodedSlug = encodeURIComponent(slug);
  const decodedSlug = decodeURIComponent(slug);
  return prisma.htmlReport.findFirst({
    where: {
      isPublished: true,
      OR: [{ slug }, { slug: encodedSlug }, { slug: decodedSlug }, { id: slug }]
    },
    include: { category: true, subcategory: true }
  });
}

export function getPublishedPdfBySlug(slug: string) {
  return prisma.pdfDocument.findFirst({
    where: { slug, isPublished: true },
    include: { category: true, subcategory: true }
  });
}

export function getPublishedTeachingLessonBySlug(slug: string) {
  return prisma.teachingLesson.findFirst({
    where: {
      isPublished: true,
      OR: [{ slug }, { id: slug }]
    },
    include: { topic: true }
  });
}

export function getTeachingLessonBySlug(slug: string) {
  return prisma.teachingLesson.findFirst({
    where: {
      OR: [{ slug }, { id: slug }]
    },
    include: { topic: true }
  });
}
