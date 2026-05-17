import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function checkStep(name: string, task: () => Promise<unknown>) {
  try {
    await task();
    return { name, ok: true };
  } catch (error) {
    return {
      name,
      ok: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

export async function GET() {
  const checks = await Promise.all([
    checkStep("articles", () => prisma.article.findMany({ where: { isPublished: true }, take: 1 })),
    checkStep("article_keywords", () => prisma.article.findMany({ select: { keywords: true }, take: 1 })),
    checkStep("reports", () => prisma.htmlReport.findMany({ where: { isPublished: true }, take: 1 })),
    checkStep("report_keywords", () => prisma.htmlReport.findMany({ select: { keywords: true }, take: 1 })),
    checkStep("teaching", () => prisma.teachingLesson.findMany({ where: { isPublished: true }, take: 1 })),
    checkStep("teaching_keywords", () => prisma.teachingLesson.findMany({ select: { keywords: true }, take: 1 })),
    checkStep("pdfs", () => prisma.pdfDocument.findMany({ where: { isPublished: true }, take: 1 })),
    checkStep("pdf_keywords", () => prisma.pdfDocument.findMany({ select: { keywords: true }, take: 1 })),
    checkStep("links", () => prisma.usefulLink.findMany({ take: 1 })),
    checkStep("categories", () => prisma.category.findMany({ take: 1 })),
    checkStep("content_views", () => prisma.contentView.findMany({ take: 1 }))
  ]);

  return NextResponse.json({
    ok: checks.every((check) => check.ok),
    checks
  });
}
