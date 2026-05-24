import { ImageResponse } from "next/og";

export const runtime = "edge";

const sectionLabel: Record<string, string> = {
  article: "Medical Article",
  report: "AI Report",
  pdf: "PDF Library",
  teaching: "Teaching Note"
};

function trimText(value: string, maxLength: number) {
  return value.length > maxLength ? `${value.slice(0, maxLength - 1)}...` : value;
}

export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = trimText(searchParams.get("title") || "Chestdoc", 88);
  const section = searchParams.get("section") || "article";
  const label = sectionLabel[section] ?? "Medical Note";

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "62px 74px",
          background: "linear-gradient(135deg, #f8fbff 0%, #e8f4ff 48%, #f6faf8 100%)",
          color: "#10233f",
          fontFamily: "Arial, sans-serif"
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 30,
            fontWeight: 700,
            color: "#1d5f8f"
          }}
        >
          <span>{label}</span>
          <span>Chestdoc</span>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 28
          }}
        >
          <div
            style={{
              width: 84,
              height: 8,
              borderRadius: 999,
              background: "#27a3c7"
            }}
          />
          <div
            style={{
              fontSize: 66,
              lineHeight: 1.22,
              fontWeight: 800,
              letterSpacing: 0,
              maxWidth: 980
            }}
          >
            {title}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 28,
            color: "#426076"
          }}
        >
          <span>Clinical notes and visual summaries</span>
          <span>chestdoc.vercel.app</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630
    }
  );
}
