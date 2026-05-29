import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { hasAdminSession } from "@/lib/auth";

export async function POST(request: Request) {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        if (!(await hasAdminSession())) {
          throw new Error("尚未登入後台，請重新登入後再上傳 PDF。");
        }

        return {
          allowedContentTypes: ["application/pdf"],
          addRandomSuffix: true
        };
      },
      onUploadCompleted: async () => {
        // The browser creates the database record after upload completion.
      }
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "PDF 上傳授權失敗。" },
      { status: 400 }
    );
  }
}
