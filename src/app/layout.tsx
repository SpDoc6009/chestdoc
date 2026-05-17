import type { Metadata } from "next";
import "./globals.css";
import { ReadingProgress } from "@/components/reading-progress";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

function siteUrl() {
  const rawUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/^["']|["']$/g, "");
  if (!rawUrl) return new URL("http://localhost:3000");

  try {
    return new URL(rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`);
  } catch {
    return new URL("http://localhost:3000");
  }
}

export const metadata: Metadata = {
  metadataBase: siteUrl(),
  applicationName: "一童呼吸",
  title: {
    default: "一童呼吸",
    template: "%s | 一童呼吸"
  },
  description: "胸腔科醫學筆記、指南整理、AI 深度研究報告、衛教資料整理",
  openGraph: {
    title: "一童呼吸",
    description: "胸腔科醫學筆記、指南整理、AI 深度研究報告、衛教資料整理",
    type: "website",
    locale: "zh_TW",
    images: [{ url: "/images/lung-main.png", width: 1366, height: 768 }]
  },
  icons: {
    icon: "/icon.svg",
    apple: "/apple-touch-icon.svg"
  },
  appleWebApp: {
    title: "一童呼吸",
    capable: true,
    statusBarStyle: "default"
  },
  other: {
    "apple-mobile-web-app-title": "一童呼吸"
  },
  manifest: "/manifest.webmanifest"
};

export const dynamic = "force-dynamic";

function ChunkReloadGuard() {
  const script = `
    (() => {
      const key = "next-chunk-reload-attempted-at";
      const shouldReload = (message) => /ChunkLoadError|Loading chunk .* failed|Loading CSS chunk .* failed|_next\\/static\\//.test(String(message || ""));
      const reloadOnce = () => {
        try {
          const now = Date.now();
          const last = Number(sessionStorage.getItem(key) || 0);
          if (now - last < 30000) return;
          sessionStorage.setItem(key, String(now));
        } catch {}
        window.location.reload();
      };

      window.addEventListener("error", (event) => {
        const target = event.target;
        if (target && (target.tagName === "SCRIPT" || target.tagName === "LINK")) {
          const source = target.src || target.href || "";
          if (source.includes("/_next/static/")) reloadOnce();
        }
        if (shouldReload(event.message || event.error?.message)) reloadOnce();
      }, true);

      window.addEventListener("unhandledrejection", (event) => {
        const reason = event.reason;
        const message = reason?.message || reason?.toString?.() || "";
        if (shouldReload(message)) reloadOnce();
      });
    })();
  `;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-Hant">
      <head>
        <ChunkReloadGuard />
      </head>
      <body>
        <ReadingProgress />
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
