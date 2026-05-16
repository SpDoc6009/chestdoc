import Link from "next/link";
import { Stethoscope } from "lucide-react";
import { hasAdminSession } from "@/lib/auth";
import { DesktopNav } from "@/components/desktop-nav";
import { MobileNav } from "@/components/mobile-nav";

export async function SiteHeader() {
  const isAdmin = await hasAdminSession().catch((error) => {
    console.error("Failed to check admin session", error);
    return false;
  });

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white/94 backdrop-blur">
      <div className="section-shell relative flex min-h-16 items-center justify-between gap-3 py-3">
        <Link href="/" className="flex min-w-0 items-center gap-2 text-base font-semibold text-primary">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Stethoscope className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="min-w-0 max-w-[260px] leading-5 sm:max-w-none">在胸腔重症裡，陪你找回自然的呼吸</span>
        </Link>
        <MobileNav isAdmin={isAdmin} />
        <DesktopNav isAdmin={isAdmin} />
      </div>
    </header>
  );
}
