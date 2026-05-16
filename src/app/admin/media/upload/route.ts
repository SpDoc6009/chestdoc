import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { hasAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

const maxImageSize = 8 * 1024 * 1024;

function getExtension(file: File) {
  const fromName = file.name.split(".").pop();
  if (fromName && /^[a-zA-Z0-9]+$/.test(fromName)) return fromName.toLowerCase();
  const fromType = file.type.split("/").pop();
  return fromType?.replace("jpeg", "jpg") || "png";
}

export async function POST(request: Request) {
  try {
    if (!(await hasAdminSession())) {
      return NextResponse.json({ error: "尚未登入後台，請重新登入後再上傳圖片。" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "沒有收到圖片檔案。" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "只能上傳圖片檔案。" }, { status: 400 });
    }

    if (file.size > maxImageSize) {
      return NextResponse.json({ error: "圖片需小於 8 MB。" }, { status: 400 });
    }

    const safeName = `${Date.now()}-${randomUUID()}.${getExtension(file)}`;

    const bytes = Buffer.from(await file.arrayBuffer());

    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const blob = await put(`images/${safeName}`, bytes, {
          access: "public",
          contentType: file.type
        });

        return NextResponse.json({
          url: blob.url,
          fileName: file.name || safeName
        });
      } catch (error) {
        if (process.env.VERCEL) {
          throw error;
        }
        console.warn("Vercel Blob upload failed locally. Falling back to public/uploads.", error);
      }
    }

    if (process.env.VERCEL) {
      return NextResponse.json(
        { error: "Vercel Blob token 尚未設定，請加入 BLOB_READ_WRITE_TOKEN。" },
        { status: 500 }
      );
    }

    const uploadDir = join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });
    await writeFile(join(uploadDir, safeName), bytes);

    return NextResponse.json({
      url: `/uploads/${safeName}`,
      fileName: file.name || safeName
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "圖片上傳失敗。" },
      { status: 500 }
    );
  }
}
