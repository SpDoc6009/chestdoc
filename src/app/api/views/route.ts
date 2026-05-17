import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

const allowedTypes = new Set(["article", "report", "teaching", "pdf"]);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const contentType = typeof body.contentType === "string" ? body.contentType : "";
    const contentId = typeof body.contentId === "string" ? body.contentId : "";
    const title = typeof body.title === "string" ? body.title.slice(0, 240) : "";
    const path = typeof body.path === "string" ? body.path.slice(0, 500) : "";

    if (!allowedTypes.has(contentType) || !contentId || !title || !path) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    await prisma.contentView.upsert({
      where: {
        contentType_contentId: {
          contentType,
          contentId
        }
      },
      create: {
        contentType,
        contentId,
        title,
        path,
        viewCount: 1
      },
      update: {
        title,
        path,
        viewCount: { increment: 1 }
      }
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
