import { NextResponse } from "next/server";
import { getPublishedReportBySlug } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const report = await getPublishedReportBySlug(slug);
  if (!report) {
    return new NextResponse("Not found", { status: 404 });
  }

  return new NextResponse(report.htmlContent, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Security-Policy": "default-src 'none'; img-src data: https:; style-src 'unsafe-inline'; script-src 'unsafe-inline'; font-src data: https:; connect-src 'none';"
    }
  });
}
