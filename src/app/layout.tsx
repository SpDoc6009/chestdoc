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
  title: {
    default: "胸腔重症間，陪你找回自然的呼吸",
    template: "%s | 胸腔重症間，陪你找回自然的呼吸"
  },
  description: "胸腔科醫學筆記、指南整理、AI 深度研究報告、衛教資料整理",
  openGraph: {
    title: "胸腔重症間，陪你找回自然的呼吸",
    description: "胸腔科醫學筆記、指南整理、AI 深度研究報告、衛教資料整理",
    type: "website",
    locale: "zh_TW",
    images: [{ url: "/images/lung-main.png", width: 1366, height: 768 }]
  },
  icons: {
    icon: "/icon.svg",
    apple: "/apple-touch-icon.svg"
  },
  manifest: "/manifest.webmanifest"
};

export const dynamic = "force-dynamic";

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-Hant">
      <body>
        <ReadingProgress />
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
