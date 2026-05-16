import { NextResponse } from "next/server";
import { hasAdminSession } from "@/lib/auth";
import { getTeachingLessonBySlug } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lesson = await getTeachingLessonBySlug(slug);
  const preview = new URL(request.url).searchParams.get("preview") === "1";
  const isAdmin = preview ? await hasAdminSession() : false;
  if (!lesson || (!lesson.isPublished && !isAdmin) || !lesson.htmlContent) {
    return new NextResponse("Not found", { status: 404 });
  }

  return new NextResponse(lesson.htmlContent, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Security-Policy": "default-src 'none'; img-src data: https:; style-src 'unsafe-inline'; script-src 'unsafe-inline'; font-src data: https:; connect-src 'none';"
    }
  });
}
