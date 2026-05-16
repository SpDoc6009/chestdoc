import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const lesson = await prisma.teachingLesson.findUnique({ where: { id } });
  if (!lesson || !lesson.htmlContent) {
    return new NextResponse("Not found", { status: 404 });
  }

  return new NextResponse(lesson.htmlContent, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Security-Policy": "default-src 'none'; img-src data: https:; style-src 'unsafe-inline'; script-src 'unsafe-inline'; font-src data: https:; connect-src 'none';"
    }
  });
}
