"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, BookOpenCheck, FileText, FolderTree, HeartPulse, Home, LinkIcon, Search, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "首頁", icon: Home },
  { href: "/reports", label: "醫學新知", icon: Activity },
  { href: "/articles", label: "圖文解說", icon: FileText },
  { href: "/education", label: "衛教園區", icon: HeartPulse },
  { href: "/teaching", label: "匹車歪教學筆記", icon: BookOpenCheck },
  { href: "/categories", label: "疾病分類", icon: FolderTree },
  { href: "/pdfs", label: "PDF 文件庫", icon: FileText },
  { href: "/links", label: "常用連結", icon: LinkIcon },
  { href: "/search", label: "搜尋", icon: Search }
];

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DesktopNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();

  return (
    <nav className="hidden flex-wrap items-center justify-end gap-1 text-sm text-muted-foreground lg:flex">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = isActivePath(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "relative inline-flex items-center gap-1.5 rounded-md px-2.5 py-2 transition-colors hover:bg-accent hover:text-accent-foreground",
              isActive && "bg-blue-50 text-primary"
            )}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {item.label}
            {isActive ? <span className="absolute inset-x-2 -bottom-1 h-0.5 rounded-full bg-primary" aria-hidden="true" /> : null}
          </Link>
        );
      })}
      {isAdmin ? (
        <Link
          href="/admin"
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md bg-primary px-2.5 py-2 text-white transition-colors hover:bg-primary/90",
            pathname.startsWith("/admin") && "ring-2 ring-blue-200"
          )}
        >
          <Settings className="h-4 w-4" aria-hidden="true" />
          後台管理
        </Link>
      ) : null}
    </nav>
  );
}
