import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function hasValue(key: string) {
  return Boolean(process.env[key]?.trim());
}

export async function GET() {
  const env = {
    DATABASE_URL: hasValue("DATABASE_URL"),
    DATABASE_URL_UNPOOLED: hasValue("DATABASE_URL_UNPOOLED"),
    ADMIN_PASSWORD: hasValue("ADMIN_PASSWORD"),
    ADMIN_SESSION_SECRET: hasValue("ADMIN_SESSION_SECRET"),
    BLOB_READ_WRITE_TOKEN: hasValue("BLOB_READ_WRITE_TOKEN"),
    NEXT_PUBLIC_SITE_URL: hasValue("NEXT_PUBLIC_SITE_URL")
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({
      ok: true,
      database: "connected",
      env
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        database: "failed",
        env,
        error: error instanceof Error ? error.message : "Unknown database error"
      },
      { status: 500 }
    );
  }
}
